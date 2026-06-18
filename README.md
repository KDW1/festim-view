# **FESTIMVIEW** Central Components
1. **Next.js Frontend**
    - The Python Editor
    - The FESTIM Window (Trame Iframe, FESTIM Code Prompts)
    - The Python Console
2. **Python Backend**
    - The Flask Web Server
## 1. Important Processes and Structures
### Internal Representation of FESTIM Simulation
There are three central types representing all of our FESTIM simulations, they are `FESTIMSim`, `FESTIMSetting`, and `FESTIMStep`. They can be found in `utils/simulations.ts`  

`FESTIMSim` is an array of `FESTIMStep`s that describe how the steps of setting up a particular simulation.  
`FESTIMStep` contains an array of `FESTIMSetting`s, with details on how to arrange them given a particular `recipe`.  
`FESTIMSetting` consists of the basic information associated with variables that are integral to a FESTIM simulation. They represent basic data types, FESTIM classes, and contain additional parameters to allow for more precise inputs.  

### FESTIM Recipe
The `recipe` associated with a `FESTIMStep` describes how the `FESTIMSetting`s it contains should be translated into the proper Python code for that FESTIM simulation. There are three unique keywords that correspond to variables, classes, and lists.

1. {\***variable**\*}, for *values* in the binding 
    - If I have a key, value pair in the binding `{material_name: "Vibranium"}`
    - Then "{\***material_name**\*}" -> "Vibranium"
2. {\***className**.prop\*}, for *class properties* associated in the binding
    - If I have a class of materials charecterized by name and id
    - Then "{\***material**.name\*}, Material ID #{\***material**.id\*}" becomes "Vibranium, Material ID #5"
3. \$**list**--expression\$, for *list expressions* for a list in the binding
    - If I have a list of material names with a generic item name, "material".
    - Then "\$**material_names**\--{\***material**.name\*}, $" -> "vibranium, astrophage, "
### Recipe Parser
Generates corresponding code snippets, *can toggle showing all code or not* based on a toggled variable
1. Tokenizer, splits based on special characters at the instance of every $,{\*,\*},--
2. Parsing Function, crawl across the tokens by a moving index  
Inspired by 6.1010's "SymbolicAlgebra", "LISP" parsers!
    - Encounters *$* → list expression
        - Finds the next token, the *arrayName*
        - Finds the closing *$* and its closing index
        - The content in between the *arrayName* and that closingIndex is the *expression*
        - Accessing that array, each object in it is like an individual frame to execute the expression within the context of
    - Encounter *{\** → variable expression
        - Finds the next token, the *variableName*
        - Looks up the *variableName* with the current binding
    - Otherwise, we pass the token as it is
### FESTIM Code Prompts State Management
The most important states associated with the FESTIM Code Prompts component are the:
1. **currentSimulation**, the current simulation
2. **bindings,** an initialized set of bindings that makes code prompts work
    - Crawls through *currentSimulation.steps* and makes default value
### Code Prompt Field Generation
Corresponding Field Generation
1. Basic Types that correspond to *simple values*
    - They bind to **bindings[variable]**
    - Become simple input values
2. Custom Classes Structure that corresponds to *custom classes*
    - They bind to **bindings[classPrefix.prop]**
    - Break up into simple input values by a recursive call to the correspoding field function for each setting contained by the class
3. Input List that correspond to *lists*
    - The difference here is that our context is **bindings[listName]**
    - Here, we search for the binding corresponding to a generic **itemName**.
### The Python Editor
The primary features of the Python Editor are as follows:
- Evaluate code as an expression
- Execute code as a program
- View console notifications that track general notifications pertaining to information, errors, outputs, results, etc...
- Keyboard shortcuts for toggling evaluation, running the program
- Currently there are temporary namespaces for each evaluation and expression
