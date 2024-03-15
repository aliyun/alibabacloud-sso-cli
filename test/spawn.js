import cp from 'child_process';

export function spawn(command, args, options) {
  const child = cp.spawn(command, args, options);
  return new Promise((resolve) => {
    const stdout = [];
    const stderr = [];

    child.stdout.on('data', (chunk) => {
      stdout.push(chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderr.push(chunk);
    });

    child.on('exit', (code) => {
      resolve({
        code: code,
        stdout: Buffer.concat(stdout).toString(),
        stderr: Buffer.concat(stderr).toString()
      });
    });
  });
}