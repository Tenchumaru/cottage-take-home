import { readFile } from 'fs/promises';
import { basename } from 'path';

type Stage = {
  name: string;
  prerequisites: string[];
};

if (process.argv.length < 4) {
  console.error('no files provided');
} else {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err.message);
  });
}

async function main(filePaths: string[]): Promise<void> {
  // Ensure the last file is a "phases.json" file.
  const phasesFilePath = filePaths[filePaths.length - 1];
  if (basename(phasesFilePath).toLowerCase() !== 'phases.json') {
    throw new Error('no phases.json file');
  }

  // Read and parse the contents of all files.
  const fileContents = await Promise.all(filePaths.map((filePath) => readFile(filePath, 'utf-8')));

  // Create a dictionary mapping file titles to file contents.
  const dict = filePaths.slice(0, filePaths.length).reduce((p, c, i) => {
    p[basename(c, '.json').toLowerCase()] = JSON.parse(fileContents[i]) as Stage[];
    return p;
  }, {} as { [name: string]: Stage[] });

  // Ensure the phases match the file names ignoring case.
  const phases = JSON.parse(await readFile(phasesFilePath, 'utf-8')) as Stage[];
  if (phases.length !== filePaths.length - 1) {
    throw new Error('invalid file count');
  } else if (!phases.every((phase) => dict[phase.name.toLowerCase()] !== undefined)) {
    throw new Error('missing phases');
  }

  // Sort the phases by prerequisites.
  phases.sort(compare);

  // Sort the stages of each phase by prerequisites and print them.
  phases.forEach((phase, phaseIndex) => {
    console.log(phaseIndex + 1, phase.name);
    const stages = dict[phase.name.toLowerCase()];
    stages.sort(compare);
    stages.forEach((stage, stageIndex) => {
      console.log(`${phaseIndex + 1}.${stageIndex + 1}`, stage.name);
    });
  });

  function compare(a: Stage, b: Stage): number {
    if (a.prerequisites.includes(b.name)) {
      return 1;
    } else if (b.prerequisites.includes(a.name)) {
      return -1;
    }
    return 0;
  }
}
