"""Explicit implementation selection. No environment-variable overrides."""

from importlib import import_module
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]


def load_implementation(target: str = "starter") -> SimpleNamespace:
    if target not in ("starter", "example"):
        raise ValueError("Target must be starter or example.")
    prefix = "src" if target == "starter" else "example.src"
    modules = []
    for name in ("rules", "game"):
        expected = ROOT / Path(*prefix.split(".")) / f"{name}.py"
        if not expected.is_file():
            raise ModuleNotFoundError(
                f"Local {target} implementation is absent: {expected}. "
                "Fresh attempts intentionally exclude the example."
            )
        module = import_module(f"{prefix}.{name}")
        module_file = module.__file__
        if module_file is None or Path(module_file).resolve() != expected:
            raise ImportError(
                "Refusing to load an implementation from outside this project."
            )
        modules.append(module)
    rules, game = modules
    functions = {
        name: getattr(rules, name)
        for name in ("get_flips", "get_legal_moves", "apply_move", "count_discs")
    }
    functions.update(
        {name: getattr(game, name) for name in ("play_move", "pass_turn", "get_result")}
    )
    return SimpleNamespace(**functions)
