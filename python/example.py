import festim as F
import numpy as np

my_model = F.HydrogenTransportProblem()

protium = F.Species("H")
deuterium = F.Species("D")
tritium = F.Species("T")
my_model.species = [protium, deuterium, tritium]

my_model.mesh = F.Mesh1D(np.linspace(0, 1, 100))

left_surf = F.SurfaceSubdomain1D(id=1, x=0)
right_surf = F.SurfaceSubdomain1D(id=2, x=1)

# Enviornment setup is:
# "conda create -n fenics-env -c conda-forge fenics"
# "conda activate fenics-env"