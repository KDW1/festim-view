import vtk
import os

def create_single_pyramid(x_offset=0.0, y_offset=0.0, z_offset=0.0):
    """
    Create a single pyramid cell.

    Pyramids are transition elements in hybrid meshes:
    - 5 vertices, 5 faces (1 quad + 4 triangular)
    - Connect quad-faced cells to triangle-faced cells
    - Essential for hex-tet transitions

    In CFD, pyramids are used to:
    - Bridge structured (hex) and unstructured (tet) regions
    - Avoid non-conformal interfaces
    - Enable smooth mesh transitions

    Args:
        x_offset, y_offset, z_offset: Position offset

    Returns:
        tuple: (vtkPoints, vtkPyramid, vtkUnstructuredGrid)
    """
    points = vtk.vtkPoints()
    # Pyramid vertices (square base + apex)
    points.InsertNextPoint(x_offset + 0.0, y_offset + 0.0, z_offset + 0.0)
    points.InsertNextPoint(x_offset + 1.0, y_offset + 0.0, z_offset + 0.0)
    points.InsertNextPoint(x_offset + 1.0, y_offset + 1.0, z_offset + 0.0)
    points.InsertNextPoint(x_offset + 0.0, y_offset + 1.0, z_offset + 0.0)
    points.InsertNextPoint(x_offset + 0.5, y_offset + 0.5, z_offset + 1.0)

    pyramid = vtk.vtkPyramid()
    for i in range(5):
        pyramid.GetPointIds().SetId(i, i)

    ugrid = vtk.vtkUnstructuredGrid()
    ugrid.SetPoints(points)
    ugrid.InsertNextCell(pyramid.GetCellType(), pyramid.GetPointIds())

    return points, pyramid, ugrid


points, pyramid, ugrid = create_single_pyramid()

writer = vtk.vtkXMLUnstructuredGridWriter()
writer.SetInputDataObject(ugrid)
writer.SetFileName(os.path.join(os.getcwd(),"out/vtk/pyramid.vtu"))
writer.Write()