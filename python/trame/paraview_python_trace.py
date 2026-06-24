# trace generated using paraview version 6.1.1
#import paraview
#paraview.compatibility.major = 6
#paraview.compatibility.minor = 1

#### import the simple module from the paraview
from paraview.simple import *
#### disable automatic camera reset on 'Show'
paraview.simple._DisableFirstRenderCameraReset()

# create a new 'ADIOS2VTXReader'
field_exportbp = ADIOS2VTXReader(registrationName='field_export.bp', FileName='\\\\wsl.localhost\\Ubuntu\\home\\kwillsun\\festim-view\\out\\field_export.bp')

# get animation scene
animationScene1 = GetAnimationScene()

# update animation scene based on data timesteps
animationScene1.UpdateAnimationUsingDataTimeSteps()

# set active source
SetActiveSource(field_exportbp)

# get active view
renderView1 = GetActiveViewOrCreate('RenderView')

# show data in view
field_exportbpDisplay = Show(field_exportbp, renderView1, 'UnstructuredGridRepresentation')

# trace defaults for the display properties.
field_exportbpDisplay.Representation = 'Surface'

#changing interaction mode based on data extents
renderView1.Set(
    CameraPosition=[0.25, 0.5, 3.35],
    CameraFocalPoint=[0.25, 0.5, 0.0],
)

# get the material library
materialLibrary1 = GetMaterialLibrary()

# reset view to fit data
renderView1.ResetCamera(False, 0.9)

# set scalar coloring
ColorBy(field_exportbpDisplay, ('POINTS', 'H_1'))

# rescale color and/or opacity maps used to include current data range
field_exportbpDisplay.RescaleTransferFunctionToDataRange(True, False)

# show color bar/color legend
field_exportbpDisplay.SetScalarBarVisibility(renderView1, True)

# get color transfer function/color map for 'H_1'
h_1LUT = GetColorTransferFunction('H_1')

# get opacity transfer function/opacity map for 'H_1'
h_1PWF = GetOpacityTransferFunction('H_1')

# get 2D transfer function for 'H_1'
h_1TF2D = GetTransferFunction2D('H_1')

# show data in view
field_exportbpDisplay = Show(field_exportbp, renderView1, 'UnstructuredGridRepresentation')

# reset view to fit data
renderView1.ResetCamera(False, 0.9)

#changing interaction mode based on data extents
renderView1.CameraPosition = [0.25, 0.5, 3.35]

# show color bar/color legend
field_exportbpDisplay.SetScalarBarVisibility(renderView1, True)

#================================================================
# addendum: following script captures some of the application
# state to faithfully reproduce the visualization during playback
#================================================================

# get layout
layout1 = GetLayout()

#--------------------------------
# saving layout sizes for layouts

# layout/tab size in pixels
layout1.SetSize(1459, 825)

#-----------------------------------
# saving camera placements for views

# current camera placement for renderView1
renderView1.Set(
    InteractionMode='2D',
    CameraPosition=[0.25, 0.5, 3.35],
    CameraFocalPoint=[0.25, 0.5, 0.0],
    CameraParallelScale=0.6326324010416072,
)


##--------------------------------------------
## You may need to add some code at the end of this python script depending on your usage, eg:
#
## Render all views to see them appears
# RenderAllViews()
#
## Interact with the view, usefull when running from pvpython
# Interact()
#
## Save a screenshot of the active view
# SaveScreenshot("path/to/screenshot.png")
#
## Save a screenshot of a layout (multiple splitted view)
# SaveScreenshot("path/to/screenshot.png", GetLayout())
#
## Save all "Extractors" from the pipeline browser
# SaveExtracts()
#
## Save a animation of the current active view
# SaveAnimation()
#
## Please refer to the documentation of paraview.simple
## https://www.paraview.org/paraview-docs/nightly/python/
##--------------------------------------------