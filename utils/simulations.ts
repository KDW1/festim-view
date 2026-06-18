// Setting in a step of a FESTIM simulation
export type FESTIMSetting = {
  title: string;
  type: string; // "string" | "number" | "boolean" | "enum" | "..." 
  description?: string;
  list?: boolean;
  itemName?: string; // Generic name for element in list
  options?: string[]; // Options for enum type
  name?: string;
  defaultValue?: string;
}

// Step in a FESTIM simulation
export type FESTIMStep = {
  title: string;
  description?: string;
  settings: FESTIMSetting[];
  recipe?: string; // Recipe for assembling Python code
}

// FESTIM simulation, composed of multiple steps
export type FESTIMSim = {
  title: string;
  steps: FESTIMStep[]
}

// Dictionary of FESTIM classes
// FESTIM classes are composed of simpler data types, FESTIM settings
export type ClassDictionary = {
  [key: string]: FESTIMSetting[]
}


export const customClasses: ClassDictionary = {
  "person": [
    {
      title: "Name",
      type: "string",
      name: "name",
    },
    {
      title: "Age",
      type: "number",
      name: "age"
    },
    {
      title: "Companion",
      type: "enum",
      name: "companion",
      options: [
        "Radioactive Spider (Earth-42)",
        "Momo",
        "Rocky",
        "BB-8"
      ]
    }
  ],
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
  ],
  "volume": [
    {
      title: "Variable",
      name: "variable",
      description: "variable name",
      type: "string"
    },
    {
      title: "ID",
      name: "id",
      description: "the id of the volume subdomain",
      type: "number"
    },
    {
      title: "Material Variable",
      name: "material",
      description: "the material assigned to the subdomain",
      type: "string"
    },
    {
      title: "Locator Expression",
      name: "locator",
      description: "locator function",
      type: "string"
    }
  ],
  "surface": [
    {
      title: "Variable",
      description: "variable name",
      type: "string",
      name: "variable"
    },
    {
      title: "ID",
      description: "the id of the surface subdomain",
      type: "string",
      name: "id"
    },
    {
      title: "Locator Expression",
      description: "a callable function that locates the boundary facets of the subdomain",
      type: "string",
      name: "locator"
    },
    {
      title: "Linked Volume Variable",
      type: "string",
      name: "linked_volume_variable"
    }
  ],
  "interface": [
    {
      title: "Variable",
      name: "variable",
      type: "string",
      description: "variable_name"
    },
    {
      title: "ID",
      name: "id",
      type: "number",
      description: "tag of the interface subdomain in the parent mesh tags."
    },
    {
      title: "Subdomains",
      name: "subdomains",
      type: "string",
      description: "the two subdomains sharing this interface, (comma separated values)"
    },
    {
      title: "Penalty Term",
      name: "penalty_term",
      type: "number",
      description: "penalty parameter for the interface formulation"
    }
  ]
}

const exampleStep : FESTIMStep = {
  title: "List Example",
  description: "Testing how to make lists",
  settings: [
    {
      title: "Favorite Movie",
      name: "favorite_movie",
      type: "string",
      list: false
    },
    {
      title: "Person",
      name: "person",
      type: "person",
      list: false
    },
    {
      title: "Friends",
      name: "friends",
      itemName: "friend",
      type: "person",
      list: true
    }
  ],
  recipe: 
`favorite_movie="{*favorite_movie*}"
person={
  "name": "{*person.name*}",
  "age": {*person.age*},
  "companion": "{*person.companion*}"
}
person.friends = [$friends--{
  "name": "{*friend.name*}",
  "age": {*friend.age*},
  "companion": "{*friend.companion*}"
},$]
`
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
  recipe: "#1 Create empty problem\n{*problem_variable*}=F.{*problem_type*}()"
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
nx = {*nx*}
ny = {*ny*}

coordinate_system = "{*coordinate_system*}"

lower_left = np.array([{*xmin*}, {*ymin*}])
upper_right = np.array([{*xmax*}, {*ymax*}])
cell_type = dolfinx.mesh.CellType.{*cell_type*}

{*dolfinx_mesh_variable*} = dolfinx.mesh.create_rectangle(
    MPI.COMM_WORLD, [lower_left, upper_right], [nx, ny], cell_type=cell_type
)
problem.mesh = F.Mesh({*dolfinx_mesh_variable*}, coordinate_system=coordinate_system)`
}

const materialsStep: FESTIMStep = {
  title: "3. Materials",
  settings: [
    {
      title: "Materials",
      name: "materials",
      type: "material",
      itemName: "material",
      list: true,
    }
  ],
  recipe: `# 3. Create materials
$materials--{*material.variable*} = F.Material(name="{*material.name*}", D_0={*material.D_0*}, E_D={*material.E_D*}, K_S_0={*material.K_S_0*}, E_K_S={*material.E_K_S*})$`
}

const domainsStep: FESTIMStep = {
  title: "4. Domains",
  settings: [
    {
      title: "epsilon_helper_variable",
      type: "number",
    },
    {
      title: "Volume Subdomains",
      type: "volume",
      name:"volumes",
      itemName: "volume",
      list: true
    },
    {
      title: "Surface Subdomains",
      type: "surface",
      name: "surfaces",
      itemName: "surface",
      list: true
    },
    {
      title: "Interfaces",
      type: "interface",
      name: "interfaces",
      itemName: "interface",
      list: true
    }
  ],
  recipe: `# 4. Create domains
eps = {*epsilon_helper_variable*}

$volumes--{*volume.variable*}=F.VolumeSubdomain(id={*volume.id*}, material={*volume.material*}, locator={*volume.locator*})$

$surfaces--{*surface.variable*}=F.SurfaceSubdomain(id={*surface.id*}, locator={*surface.locator*})$

problem.subdomains = [$volumes--{*volume.variable*}, $$surfaces--{*surface.variable*}, $]

problem.surface_to_volume = {
$surfaces-- {*surface.variable*} : {*surface.linked_volume_variable*}$
}

$interfaces--{*interface.variable*}=F.Interface(id={*interface.id*}, subdomains=[{*interface.subdomains*}], penalty_term={*interface.penalty_term*})$
problem.interfaces = [$interfaces--{*interface.variable*},$]
`
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

export const exampleSimulation : FESTIMSim = {
  title: "Example Simulation",
  steps: [
    exampleStep
  ]
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