export type FESTIMSetting = {
  title: string;
  type: string;
  description?: string;
  list?: boolean;
  itemName?: string;
  options?: string[];
  name?: string;
  defaultValue?: string;
}

// TODO: 
// 1. Add recipe for assembling Python variables
// 2. Have some default Python code, so that even
//    with empty fields we can have something
// 3. Add the bindings that define how custom types,
//    take in data

// These settings cover types such as
// diffusion constants -> number
// variable names -> string
// select values from a set of options -> enum
// binary values like species mobility, transience -> boolean

// Custom values like Materials, Subdomains, 
// will be recognized as non default types 
// and a dictionary (soon to be made) will organize
// those data types!

// However, we also need to be able to make a list of values like
// if we have a list of boundary conditions, subdomains 
// hence the list value

export type FESTIMStep = {
  title: string;
  description?: string;
  settings: FESTIMSetting[];
  recipe?: string;
  // The recipe will describe
  // how the bindings should be parsed
  // into Python code 
}
export type FESTIMSim = {
  title: string;
  steps: FESTIMStep[]
}

export type ClassDictionary = {
  [key: string]: FESTIMSetting[]
}

export const customClasses: ClassDictionary = {
  "material": [
    {
      title: "Variable",
      description: "variable name",
      name: "variable",
      type: "string"
    },
    {
      title: "Name",
      description: "the name of the material",
      name: "name",
      type: "string"
    },
    {
      title: "D_0",
      description: "the pre-exponential factor of the diffusion coefficient (m2/s)",
      name: "D_0",
      type: "number"
    },
    {
      title: "E_D",
      description: "the activation energy of the diffusion coefficient (eV)",
      name: "E_D",
      type: "number"
    },
    {
      title: "K_S_0",
      description: "the pre-exponential factor of the solubility coefficient (H/m3/Pa0.5)",
      name: "K_S_0",
      type: "number"
    },
    {
      title: "E_K_S",
      description: "the activation energy of the solubility coeficient (eV)",
      name: "E_K_S",
      type: "number"
    },
  ]
}

const listStep : FESTIMStep = {
  title: "List Example",
  description: "Testing how to make lists",
  settings: [
    {
      title: "Integers",
      name: "integers",
      itemName: "integer",
      type: "number",
      list: true
    },
    {
      title: "Number",
      name: "number",
      type: "number",
      list: false
    }
  ],
  recipe: 
  `$integers{integer}$
number = {number}`
}

const problemStep: FESTIMStep = {
  title: "1. Problem",
  description: "Create the root FESTIM problem object.",
  settings: [
    {
      title: "Python variable",
      name: "problem_variable",
      type: "string"
    },
    {
      title: "Problem Type",
      type: "enum",
      name: "problem_type",
      options: [
        "HydrogenTransportProblemDiscontinuous",
        "HydrogenTransportProblem"
      ]
    }
  ],
  recipe: "#1 Create empty problem\n{problem_variable}=F.{problem_type}()"
}
const meshStep: FESTIMStep = {
  title: "2. Mesh",
  settings: [
    {
      title: "dolfinx mesh variable",
      name: "dolfinx_mesh_variable",
      type: "string"
    },
    {
      title: "nx",
      name: "nx",
      type: "number"
    },
    {
      title: "ny",
      type: "number"
    },
    {
      title: "xmin",
      type: "number"
    },
    {
      title: "xmax",
      type: "number"
    },
    {
      title: "ymin",
      type: "number"
    },
    {
      title: "ymax",
      type: "number"
    },
    {
      title: "Coordinate system",
      name: "coordinate_system",
      type: "enum",
      options: [
        "cartesian",
        "cylindrical",
        "spherical"
      ]
    },
    {
      title: "Cell type",
      name: "cell_type",
      type: "enum",
      options: [
        "triangle",
        "quadrilateral"
      ]
    }
  ],
  recipe: `# 2. Create mesh
# here we create a 2D rectangular mesh.
nx = {nx}
ny = {ny}

coordinate_system = "{coordinate_system}"

lower_left = np.array([{xmin}, {ymin}])
upper_right = np.array([{xmax}, {ymax}])
cell_type = dolfinx.mesh.CellType.{cell_type}

{dolfinx_mesh_variable} = dolfinx.mesh.create_rectangle(
    MPI.COMM_WORLD, [lower_left, upper_right], [nx, ny], cell_type=cell_type
)
problem.mesh = F.Mesh({dolfinx_mesh_variable}, coordinate_system=coordinate_system)`
}

const materialsStep: FESTIMStep = {
  title: "3. Materials",
  settings: [
    {
      title: "Materials",
      name: "materials",
      type: "material",
      list: true,
    }
  ],
  recipe: `# 3. Create materials
{material.variable} = F.Material(name="{material.name}", D_0={material.D_0}, E_D={material.E_D}, K_S_0={material.K_S_0}, E_K_S={material.E_K_S})`
}

const domainsStep: FESTIMStep = {
  title: "4. Domains",
  settings: [
    {
      title: "epsilon helper variable",
      type: "number"
    },
    {
      title: "Volume Subdomains",
      type: "volume",
      list: true
    },
    {
      title: "Surface Subdomains",
      type: "surface",
      list: true
    },
    {
      title: "Interfaces",
      type: "interface",
      list: true
    }
  ]
}

const speciesStep: FESTIMStep = {
  title: "5a. Species",
  settings: [
    {
      title: "Species",
      type: "species",
      list: false
    }
  ]
}

const initialConditionsStep: FESTIMStep = {
  title: "5b. Initial Conditions",
  settings: [
    {
      title: "Initial Concentrations",
      type: "concentration",
      list: true
    }
  ]
}

const reactionsStep: FESTIMStep = {
  title: "5c. Reactions",
  settings: [
    {
      title: "Reactions",
      type: "reaction",
      list: true
    }
  ]
}

const boundaryConditionsStep: FESTIMStep = {
  title: "6. Boundary Conditions",
  settings: [
    {
      title: "Boundary Conditions",
      type: "boundary_condition",
      list: true
    }
  ]
}

const particleSourcesStep: FESTIMStep = {
  title: "7. Particle Sources",
  settings: [
    {
      title: "Particle Sources",
      type: "source",
      list: true
    }
  ]
}

const temperatureStep: FESTIMStep = {
  title: "8. Temperature",
  settings: [
    {
      title: "Temperature (K)",
      type: "number"
    }
  ]
}

const settingsStep: FESTIMStep = {
  title: "9. Settings",
  settings: [
    {
      title: "atoi",
      type: "number"
    },
    {
      title: "rtoi",
      type: "number"
    },
    {
      title: "transient",
      type: "boolean"
    },
    {
      title: "stepsize",
      type: "number"
    },
    {
      title: "final_time",
      type: "number"
    }
  ]
}

const exportsStep: FESTIMStep = {
  title: "10. Exports",
  settings: [
    {
      title: "Field export list variable",
      type: "string"
    },
    {
      title: "Field export list variable",
      type: "string"
    },
    {
      title: "VTX Species Exports",
      type: "vtx_export",
      list: true
    },
    {
      title: "Derived Quantities - Surface",
      type: "surface_quantity",
      list: true
    },
    {
      title: "Derived Quantities - Volume",
      type: "volume_quantity",
      list: true
    },
  ]
}

const runStep: FESTIMStep = {
  title: "11. Run",
  settings: [
    {
      title: "Run",
      type: "title",
      description: "Proceed to run the simulation",
    }
  ]
}
export const listTesting : FESTIMSim = {
  title: "List Testing",
  steps: [listStep]
}

export const presetSimulations: FESTIMSim[] = [
  {
    title: "2D Permeation",
    steps: [
      problemStep,
      meshStep,
      materialsStep,
      domainsStep,
      speciesStep,
      initialConditionsStep,
      reactionsStep,
      boundaryConditionsStep,
      particleSourcesStep,
      temperatureStep,
      settingsStep,
      exportsStep,
      runStep
    ]
  }
]