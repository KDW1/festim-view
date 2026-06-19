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
  ],
  "species": [
    {
      title: "Variable",
      description: "variable name",
      type: "string",
      name: "variable"
    },
    {
      title: "Name",
      description: "a name given to the species",
      type: "string",
      name: "name"
    },
    {
      title: "Mobile",
      description: "whether a species is mobile or not",
      type: "boolean",
      name: "mobile"
    },
    {
      title: "Subdomains",
      description: "the volume subdomain where the species is (comma-separated variables)",
      type: "string",
      name: "subdomains"
    }
  ],
  "surface_quantity": [
    {
      title: "Variable",
      type: "string",
      name: "variable"
    },
    {
      title: "Quantity Type",
      type: "enum",
      name: "quantity_type",
      options: [
        "Surface Flux",
        "Total Surface",
        "Average Surface",
        "Minimum Surface",
        "Maximum Surface"
      ]
    },
    {
      title: "Field Expression",
      type: "string",
      name: "field_expression",
    },
    {
      title: "Surface Variable",
      type: "string",
      name: "surface_variable"
    }
  ],
  "volume_quantity": [
    {
      title: "Variable",
      type: "string",
      name: "variable"
    },
    {
      title: "Quantity Type",
      type: "enum",
      name: "quantity_type",
      options: [
        "Total Volume",
        "Average Volume",
        "Maximum Volume",
        "Minimum Volume"
      ]
    },
    {
      title: "Field Expression",
      type: "string",
      name: "field_expression",
    },
    {
      title: "Volume Variable",
      type: "string",
      name: "volume_variable"
    }
  ],
  "vtx_export": [
    {
      title: "Variable",
      type: "string",
      name: "variable"
    },
    {
      title: "Volume Subdomain Variable",
      type: "string",
      name: "volume_subdomain_variable"
    },
    {
      title: "Filename",
      type: "string",
      name: "filename"
    },
    {
      title: "Field Expression",
      type: "string",
      name: "field_expression"
    }
  ]
}

const exampleStep : FESTIMStep = {
  title: "Python Recipe Example",
  description: "Simple demonstration of how the Python recipe works",
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
person["friends"] = [$friends--{
  "name": "{*friend.name*}",
  "age": {*friend.age*},
  "companion": "{*friend.companion*}"
},$]
print(person)
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

$surfacesbruh--{*surface.variable*}=F.SurfaceSubdomain(id={*surface.id*}, locator={*surface.locator*})$

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
      name: "specieses",
      list: true
    }
  ],
  recipe: 
  `# 5a. Create species
$specieses--{*species.variable*} = F.Species(name="{*species.name*}", mobile={*species.mobile*})
{*species.variable*}.subdomains = [{*species.subdomains*}]
$

problem.species = [$specieses--{*species.variable*}, $]`
}

const initialConditionsStep: FESTIMStep = {
  title: "5b. Initial Conditions",
  settings: [
    {
      title: "Initial Concentrations",
      type: "concentration",
      name: "concentrations",
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
      name: "reactions",
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
      name: "boundary_conditions",
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
      name: "sources",
      list: true
    }
  ]
}

const temperatureStep: FESTIMStep = {
  title: "8. Temperature",
  settings: [
    {
      title: "Temperature (K)",
      type: "number",
      name: "temperature"
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
      name: "field_export_list_variable",
      type: "string"
    },
    {
      title: "Derived export list variable",
      name: "derived_export_list_variable",
      type: "string"
    },
    {
      title: "VTX Species Exports",
      type: "vtx_export",
      name: "vtx_exports",
      list: true
    },
    {
      title: "Derived Quantities - Surface",
      type: "surface_quantity",
      name: "surface_quantities",
      list: true
    },
    {
      title: "Derived Quantities - Volume",
      type: "volume_quantity",
      name: "volume_quantities",
      list: true
    },
  ],
  recipe: 
  `$vtx_exports--{*vtx_export.variable*} = F.VTXSpeciesExport(
  filename=f"{*vtx_export.filename*}",
  field={*vtx_export.field_expression*},
  subdomain={*vtx_export.volume_subdomain_variable*}
)$

{*field_export_list_variable*} = [$vtx_exports--{*vtx_export.variable*}, $]

$surface_quantities--{*surface_quantity.variable*} = F.{*surface_quantity.quantity_type*}(
  field={*surface_quantity.field_expression*},
  surface={*surface_quantity.surface_variable*}
)$
$volume_quantities--{*volume_quantity.variable*} = F.{*volume_quantity.quantity_type*}(
  field={*volume_quantity.field_expression*},
  surface={*volume_quantity.volume_variable*}
)$

{*derived_export_list_variable*} = [$surface_quantities--{*surface_quantity.variable*}, $$volume_quantities--{*volume_quantity.variable*}, $]
  
problem.exports = {*field_export_list_variable*} + {*derived_export_list_variable*}
`
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