from trame.app import TrameApp, get_server
from trame.ui.vuetify3 import SinglePageLayout
from trame.widgets import vuetify3 as v3
from trame.widgets import paraview, client
from trame.decorators import change

from pathlib import Path

from paraview import simple

import asyncio
import os

def get_or_create_eventloop():
    try:
        return asyncio.get_event_loop()
    except RuntimeError as ex:
        if "There is no current event loop in thread" in str(ex):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            return asyncio.get_event_loop()
        else:
            raise ex
        
get_or_create_eventloop()
# -----------------------------------------------------------------------------
# Trame setup
# -----------------------------------------------------------------------------
class VTUFileReaderApp(TrameApp):

    def __init__(self, server=None):
        super().__init__(server)
        self.server.cli.add_argument("--data", help="Path to state file", dest="data")

        # Preload paraview modules onto server
        paraview.initialize(self.server)

        self.ctrl.on_server_ready.add(self.load_data)
        self._build_ui()

    
# -----------------------------------------------------------------------------
# ParaView code
# -----------------------------------------------------------------------------


    def load_data(self, **_kwargs):
        # CLI
        args, _ = self.server.cli.parse_known_args()
        filepath = os.path.join(os.getcwd(), str(args.data))
        self.reader  = simple.XMLUnstructuredGridReader(FileName=filepath)
        self.fields = self.reader.PointArrayStatus
        self.state.field_option = "Solid"
        self.state.field_options = ("Solid", *self.fields)
        
        self.representation= simple.Show(self.reader)
        simple.ColorBy(self.representation, ("POINTS", "Solid"))
        self.view = simple.GetActiveView()
        self.view.MakeRenderWindowInteractor(True)
        simple.Render(self.view)

        # HTML
        with SinglePageLayout(self.server) as self.ui:
            self.ui.icon.click = self.ctrl.view_reset_camera
            self.ui.title.set_text("ParaView State Viewer")
            with self.ui.toolbar:
                v3.VSelect(
                    label="Choose an Option",
                    v_model=("field_option", "Solid"), # Binds to state variable
                    items=("field_options",),               # Binds to list of options
                    variant="solo",                          # Vuetify styling prop
                )
                
            with self.ui.content:
                with v3.VContainer(fluid=True, classes="pa-0 fill-height"):
                    html_view = paraview.VtkRemoteView(self.view)
                    self.ctrl.view_reset_camera = html_view.reset_camera
                    self.ctrl.view_update = html_view.update 

# -----------------------------------------------------------------------------
# GUI
# -----------------------------------------------------------------------------

    def _build_ui(self):
        self.state.trame__title = "VTU File Reader"

        with SinglePageLayout(self.server) as self.ui:
            self.ui.icon.click = self.ctrl.view_reset_camera
            self.ui.title.set_text("ParaView State Viewer")

            with self.ui.content:
                with v3.VContainer(fluid=True, classes="pa-0 fill-height"):
                    client.Loading("Loading state")

    @change("field_option")
    def on_field_option_change(self, field_option, **_kwargs):
        self.representation= simple.Show(self.reader)
        simple.ColorBy(self.representation, ("POINTS", field_option))
        
        
        print("Switching field option to ", field_option)
# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

def main():
    app = VTUFileReaderApp()
    app.server.start()

if __name__ == "__main__":
    main()
