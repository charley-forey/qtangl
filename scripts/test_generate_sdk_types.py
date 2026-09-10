"""Run with python -m unittest discover -s scripts -p test_generate_sdk_types.py."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import generate_sdk_types as generator


class GeneratorCommandTest(unittest.TestCase):
    def test_typescript_command_preserves_path_arguments_on_both_platforms(self):
        with tempfile.TemporaryDirectory(prefix="sdk generation ") as directory:
            source = Path(directory) / "open api.json"
            output = Path(directory) / "generated types" / "schema.d.ts"
            for system in ("Linux", "Windows"):
                with self.subTest(system=system), \
                     patch.object(generator, "OPENAPI", source), \
                     patch.object(generator, "TS_OUT", output), \
                     patch.object(generator.platform, "system", return_value=system), \
                     patch.dict(generator.os.environ, {"PATH": "tool-path", "npm_config_prefix": directory, "NPM_CONFIG_PREFIX": directory}, clear=True), \
                     patch.object(generator.subprocess, "run") as run:
                    generator.generate_typescript()
                    run.assert_called_once_with(
                        ["npx", "--yes", "openapi-typescript@7.6.1", str(source), "-o", str(output)],
                        check=True,
                        cwd=generator.ROOT,
                        shell=system == "Windows",
                        env={"PATH": "tool-path"},
                    )
                    self.assertTrue(output.parent.is_dir())


if __name__ == "__main__":
    unittest.main()
