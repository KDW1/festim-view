import warnings
from dolfinx import plot
import pyvista
import dolfinx
import festim as F
import matplotlib.pyplot as plt
import numpy as np
from mpi4py import MPI

if F.__version__ != "2.0b2.post2":
    warnings.warn(
        "This example was tested with festim version 2.0b2.post2. "
        "If you are using a different version, the results may differ.",
        stacklevel=2,
    )

# 1. Create empty problem

problem = F.HydrogenTransportProblemDiscontinuous()

# 2. Create mesh
# here we create a 2D rectangular mesh.
nx = 20
ny = 20

coordinate_system = "cartesian"

lower_left = np.array([0.0, 0.0])
upper_right = np.array([1.0, 1.0])
cell_type = dolfinx.mesh.CellType.triangle

mesh_dolfinx = dolfinx.mesh.create_rectangle(
    MPI.COMM_WORLD, [lower_left, upper_right], [nx, ny], cell_type=cell_type
)
problem.mesh = F.Mesh(mesh_dolfinx, coordinate_system=coordinate_system)

# 3. Create materials

mat_1 = F.Material(name="mat_1", D_0=1.0, E_D=0.0, K_S_0=0.1, E_K_S=0.0)
mat_2 = F.Material(name="mat_2", D_0=0.1, E_D=0.0, K_S_0=0.5, E_K_S=0.0)

# 4. Create domains
eps = 1e-3  # a small number to avoid numerical issues with the locator functions
volume_1 = F.VolumeSubdomain(id=1, material=mat_1, locator=lambda x: x[0] < 0.5 + eps)
volume_2 = F.VolumeSubdomain(id=2, material=mat_2, locator=lambda x: x[0] >= 0.5 - eps)

surface_1 = F.SurfaceSubdomain(id=3, locator=lambda x: np.isclose(x[0], 0.0))
surface_2 = F.SurfaceSubdomain(id=4, locator=lambda x: np.isclose(x[0], 1.0))

problem.subdomains = [volume_1, volume_2, surface_1, surface_2]

# this is needed to link the surfaces to the volumes, so that festim knows which surface belongs to which volume.
# this could be automated one day, but for now it is needed to be done manually.
problem.surface_to_volume = {
    surface_1: volume_1,
    surface_2: volume_2,
}

# because this is a discontinuous problem we need to specify the interface between the two volumes, so that festim knows how to handle the discontinuity.
problem.interfaces = [
    F.Interface(id=5, subdomains=[volume_1, volume_2], penalty_term=100)
]

# 5a. Create species
H = F.Species(name="H", mobile=True)
H.subdomains = [volume_1, volume_2]

H_trapped = F.Species(name="H_trapped", mobile=False)
H_trapped.subdomains = [volume_1, volume_2]

# NOTE this species could be ImplicitSpecies
empty_trap = F.Species(name="empty_trap", mobile=False)
empty_trap.subdomains = [volume_1, volume_2]

problem.species = [H, H_trapped, empty_trap]

# 5b. Create initial conditions

# at t=0, c_empty_trap = 1 in volume 1
ic_empty_trap = F.InitialConcentration(species=empty_trap, value=1.0, volume=volume_1)
problem.initial_conditions = [ic_empty_trap]

# NOTE by default other ICs are set to zero

# 5c. Create reactions

# H + empty_trap <-> H_trapped

reac1 = F.Reaction(
    reactant=[H, empty_trap],
    product=[H_trapped],
    k_0=0.05,
    E_k=0.0,
    p_0=0.1,
    E_p=0.0,
    volume=volume_1,
)

problem.reactions = [reac1]

# 6. Create boundary conditions
bc_1 = F.FixedConcentrationBC(subdomain=surface_1, value=1.0, species=H)
bc_2 = F.FixedConcentrationBC(subdomain=surface_2, value=0.0, species=H)
problem.boundary_conditions = [bc_1, bc_2]

# 7. Temperature
problem.temperature = 600.0  # K

# 8. Settings
problem.settings = F.Settings(
    atol=1e-10, rtol=1e-10, transient=True, stepsize=0.05, final_time=2.0
)

# 9. Exports
concentration_field_exports = [
    F.VTXSpeciesExport(
        filename=f"out/vol_{subdomain.id}.bp",
        field=problem.species,
        subdomain=subdomain,
    )
    for subdomain in problem.volume_subdomains
]

derived_quantities = [
    F.SurfaceFlux(field=H, surface=surf) for surf in problem.surface_subdomains
]

problem.exports = concentration_field_exports + derived_quantities


# initialise and run the problem
problem.initialise()
problem.run()

# post-processing: we can plot the results using the exports we created.

fig, ax = plt.subplots()
for export in derived_quantities:
    ax.plot(export.t, np.abs(export.data), label=f"Flux at surface {export.surface.id}")

ax.set_yscale("log")
ax.set_xlabel("Time (s)")
ax.set_ylabel("Flux (mol/m^2/s) (absolute value)")
ax.legend()
plt.show()

hydrogen_concentration = H.post_processing_solution
topology, cell_types, geometry = plot.vtk_mesh(hydrogen_concentration.function_space)
u_grid = pyvista.UnstructuredGrid(topology, cell_types, geometry)
u_grid.point_data["c"] = hydrogen_concentration.x.array.real
u_grid.set_active_scalars("c")
u_plotter = pyvista.Plotter()
u_plotter.add_mesh(u_grid, show_edges=True)
u_plotter.view_xy()

if not pyvista.OFF_SCREEN:
    u_plotter.show()
else:
    figure = u_plotter.screenshot("concentration.png")