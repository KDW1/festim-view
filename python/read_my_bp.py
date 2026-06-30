import os
import vtk
import adios2
import vtk
import math
from make_unstructured_grid import write_down_ugrid

# Thoughts so far...
# I don't know what H_1, H_trapped_1, empty_trap_1 convey besides some time-dependent info?
# Connectivity, shows the topology for the VTKLagrangeTriangles
# Geometry, shows the point data for the mesh
# NumberOfNodes, corresponds to point count
# NumberOfEntitties, corresponds to cell count
# types, corresponds to the vtkCellType
# step, denotes the stepping for the animation
# vtkGhostType ? 

# TODO: Learn how to incorporate the field data

input_filepath = os.path.join(os.getcwd(), "out/field_export.bp")
print(input_filepath)

def read_bp_file_to(input_filepath, output_filepath):
    points = vtk.vtkPoints()
    relevant_values = dict()

    SCALAR_FIELD_NAME = "SyntheticField"

    with adios2.FileReader(input_filepath) as s:
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
            relevant_values[variable_of_interest] = data_of_interest
            print(f"Data of interest, {variable_of_interest}\n", data_of_interest.tolist())
            if variable_of_interest == "geometry":
                for point in data_of_interest:
                    points.InsertNextPoint(point)

    # The types and pointIds are parallel arrays
    print("All points: ", points)
    print("Connectivity count: ", len(relevant_values["connectivity"]))
    ugrid = vtk.vtkUnstructuredGrid()
    ugrid.SetPoints(points)
    lagrange_triangle = vtk.vtkLagrangeTriangle()

    lagrange_triangle.GetPointIds().SetNumberOfIds(len(relevant_values["vtkOriginalPointIds"]))

    for _, pId1, pId2, pId3 in relevant_values["connectivity"]:
        lagrange_triangle = vtk.vtkLagrangeTriangle()
        lagrange_triangle.GetPointIds().InsertNextId(pId1)
        lagrange_triangle.GetPointIds().InsertNextId(pId2)
        lagrange_triangle.GetPointIds().InsertNextId(pId3)
        ugrid.InsertNextCell(lagrange_triangle.GetCellType(), lagrange_triangle.GetPointIds())

    # (Modified Function) from Adam Djellouli's https://github.com/djeada/Vtk-Examples/tree/main
    def add_relevant_point_data(dataset):
        fields = ["H_1", "H_trapped_1", "empty_trap_1"]
        for field in fields:
            float_array = vtk.vtkFloatArray()
            float_array.SetName(field)
            
            for value in relevant_values[field]:
                print(value[0])
                float_array.InsertNextValue(value[0])
                
            dataset.GetPointData().AddArray(float_array)
        
    add_relevant_point_data(ugrid)

    write_down_ugrid(ugrid, output_filepath)
    return relevant_values
    
relevant_values = read_bp_file_to("out/field_export.bp", "out/vtk/generatedGrid.vtu")
print("Relevant Values' Keys: ", relevant_values.keys())
print(len(relevant_values["vtkGhostType"]))