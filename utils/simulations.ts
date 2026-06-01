export type FESTIMSetting = {
  title: string;
  type: number | string | "enum" | boolean;
  list: boolean;
  options?: string[];
}

// These settings cover types such as
// diffusion constants -> number
// variable names -> string
// select values from a set of options -> enum
// binary values like species mobility, transience -> boolean

// Custom values like Materials, Subdomains, will get their own types

// However, we also need to be able to make a list of values like
// if we have a list of boundary conditions, subdomains 
// hence the list value

export type FESTIMStep = {
  title: string
  settings?: FESTIMSetting[]
}
export type FESTIMSim = {
  title: string;
  steps?: FESTIMStep[]
}

export const presetSimulations : FESTIMSim[] = [
  {
    title: "2D Permeation",
    steps: [
      {
        title: "1. Problem",
        settings: [
          {
            title: "Problem Type",
            type: "enum",
            options: [
              "HydrogenTransportProblemDiscontinuous",
              "HydrogenTransportProblem"
            ]
          }
        ]
      }
    ]
  }
]