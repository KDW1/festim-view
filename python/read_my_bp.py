import os
from adios2 import FileReader

print(os.path.join(os.getcwd(), "out/field_export.bp"))
with FileReader(os.path.join(os.getcwd(), "out/field_export.bp")) as s:
    # inspect variables
    vars = s.available_variables()
    attributes = s.available_attributes()
    # print("Variable Name: ", vars)
    for name, info in vars.items():
        print("\nvariable_name: " + name, end=" ")
        for key, value in info.items():
            print("\t" + key + ": " + value, end=" ")
    print(f"There are {len(attributes.keys())} attributes available: ", attributes)
    print()
    for variable_of_interest in vars:
        steps = int(vars[variable_of_interest]["AvailableStepsCount"])
        # print("\n\n")
        data_of_interest = s.read(variable_of_interest, [0, steps])
        print(f"Data of interest, {variable_of_interest}\n", data_of_interest.tolist())