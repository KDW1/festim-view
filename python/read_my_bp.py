import os
from adios2 import FileReader

with FileReader("../out/field_export.bp") as s:
    # inspect variables
    vars = s.available_variables()
    for name, info in vars.items():
        print("variable_name: " + name, end=" ")
        for key, value in info.items():
            print("\t" + key + ": " + value, end=" ")
        print()
    print()