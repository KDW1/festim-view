from trame.app import TrameApp
from trame.ui.vuetify3 import SinglePageLayout
from trame.widgets import vuetify3 as v3
from trame.widgets import paraview
from trame.decorators import change

from paraview import simple

DEFAULT_RESOLUTION = 6

# -----------------------------------------------------------------------------
# trame setup
# -----------------------------------------------------------------------------

class ConeApp(TrameApp):
    def __init__(self, server=None):   
        super().__init__(server)

        self._init_paraview()
        self._build_ui()

# -----------------------------------------------------------------------------
# ParaView code
# -----------------------------------------------------------------------------

    def _init_paraview(self):

        import os
        import vtk
        import adios2
        import vtk
        import math

        filepath = os.path.join(os.getcwd(), "out/field_export.bp")
        print(filepath)

        points = vtk.vtkPoints()

        with adios2.FileReader(filepath) as s:
            # inspect variables
            vars = s.available_variables()
            attributes = s.available_attributes()
            # print("Variable Name: ", vars)
            for name, info in vars.items():
                print("\nvariable_name: " + name, end=" ")
                for key, value in info.items():
                    print("\t" + key + ": " + value, end=" ")
            xml_root = attributes["vtk.xml"]
            print(f"\nThe XML Root is\n", xml_root)
            for variable_of_interest in vars:
                steps = int(vars[variable_of_interest]["AvailableStepsCount"])
                data_of_interest = s.read(variable_of_interest, [0, steps])
                print(f"Data of interest, {variable_of_interest}\n", data_of_interest.tolist())
                if variable_of_interest == "geometry":
                    for point in data_of_interest:
                        points.InsertNextPoint(point)

        print("All points: ", points)
        ugrid = vtk.vtkUnstructuredGrid()
        ugrid.SetPoints(points)
        
        SCALAR_FIELD_NAME = "SyntheticField"

        # Function from Adam Djellouli's https://github.com/djeada/Vtk-Examples/tree/main
        def add_point_scalars(dataset, name=SCALAR_FIELD_NAME):
            """Attach a synthetic point scalar field so datasets render with meaningful coloring."""
            scalars = vtk.vtkFloatArray()
            scalars.SetName(name)

            for point_id in range(dataset.GetNumberOfPoints()):
                x, y, z = dataset.GetPoint(point_id)
                value = math.sqrt(x * x + y * y + z * z) + 0.35 * math.sin(3.0 * x) * math.cos(
                    2.0 * y
                )
                scalars.InsertNextValue(value)

            dataset.GetPointData().SetScalars(scalars)
            
        add_point_scalars(ugrid)
        
        self.grid = ugrid
        self.representation = simple.Show(self.grid)
        self.view = simple.Render()


    @change("resolution")
    def update_cone(self, resolution, **_kwargs):
        self.cone.Resolution = resolution
        self.ctrl.view_update()


    def update_reset_resolution(self):
        self.state.resolution = DEFAULT_RESOLUTION


# -----------------------------------------------------------------------------
# GUI
# -----------------------------------------------------------------------------

    def _build_ui(self):
        self.state.trame__title = "ParaView cone"

        with SinglePageLayout(self.server) as self.ui:
            self.ui.icon.click = self.ctrl.view_reset_camera
            self.ui.title.set_text("Cone Application")

            with self.ui.toolbar:
                v3.VSpacer()
                v3.VSlider(
                    v_model=("resolution", DEFAULT_RESOLUTION),
                    min=3,
                    max=60,
                    step=1,
                    hide_details=True,
                    density="compact",
                    style="max-width: 300px",
                )
                v3.VDivider(vertical=True, classes="mx-2")
                v3.VBtn(icon="mdi-undo-variant", click=self.update_reset_resolution)

            with self.ui.content:
                with v3.VContainer(
                    fluid=True,
                    classes="pa-0 fill-height",
                ):
                    html_view = paraview.VtkRemoteView(self.view)
                    # html_view = paraview.VtkLocalView(self.view)
                    self.ctrl.view_update = html_view.update
                    self.ctrl.view_reset_camera = html_view.reset_camera

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

def main():
    app = ConeApp()
    app.server.start()

if __name__ == "__main__":
    main()
