import os
import vtk
import adios2
import vtk
import math
from make_unstructured_grid import write_down_ugrid

filepath = os.path.join(os.getcwd(), "out/field_export.bp")
print(filepath)

points = vtk.vtkPoints()
types, pointIds = list(), list()

SCALAR_FIELD_NAME = "SyntheticField"

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
        if variable_of_interest == "types":
            types = data_of_interest.tolist()
        if variable_of_interest == "vtkOriginalPointIds":
            pointIds = data_of_interest.tolist()

# The types and pointIds are parallel arrays
print("All points: ", points)
ugrid = vtk.vtkUnstructuredGrid()
ugrid.SetPoints(points)
lagrange_triangle = vtk.vtkLagrangeTriangle()

lagrange_triangle.GetPointIds().SetNumberOfIds(len(pointIds))

for i, pointId in enumerate(pointIds):
    lagrange_triangle.GetPointIds().SetId(i, pointId[0])
    
lagrange_triangle = vtk.vtkLagrangeTriangle()
ugrid.InsertNextCell(lagrange_triangle.GetCellType(), lagrange_triangle.GetPointIds())

print("Types: ", types)
print("Point IDs: ", pointIds)
# ugrid.InsertNextCell(types, pointIds)

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

write_down_ugrid(ugrid, "out/vtk/generatedGrid.vtu")