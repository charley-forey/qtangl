from __future__ import annotations

from docplex.mp.model import Model

from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_aer import AerSimulator
from qiskit_aer.primitives import SamplerV2
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit_optimization.minimum_eigensolvers import QAOA
from qiskit_optimization.optimizers import SPSA
from qiskit_optimization.translators import from_docplex_mp
from qiskit_optimization.utils import algorithm_globals


def main() -> None:
    n = 4
    edges = [(0, 1, 1.0), (0, 2, 1.0), (0, 3, 1.0), (1, 2, 1.0), (2, 3, 1.0)]

    model = Model()
    x = model.binary_var_list(n)
    model.maximize(
        model.sum(
            weight * x[i] * (1 - x[j]) + weight * (1 - x[i]) * x[j]
            for i, j, weight in edges
        )
    )
    model.add(x[0] == 1)

    problem = from_docplex_mp(model)

    seed = 1234
    algorithm_globals.random_seed = seed
    spsa = SPSA(maxiter=50)
    simulator = AerSimulator()
    sampler = SamplerV2(seed=seed, default_shots=2048)
    pass_manager = generate_preset_pass_manager(
        optimization_level=1, backend=simulator
    )
    qaoa = QAOA(sampler=sampler, optimizer=spsa, reps=2, pass_manager=pass_manager)
    result = MinimumEigenOptimizer(qaoa).solve(problem)

    print(result.prettyprint())


if __name__ == "__main__":
    main()
