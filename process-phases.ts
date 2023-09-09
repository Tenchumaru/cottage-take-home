import { readFile } from 'fs/promises';
import { basename } from 'path';

type Stage = {
  name: string;
  prerequisites: string[];
};

if (process.env['NODE_ENV'] === undefined) {
  if (process.argv.length < 3) {
    console.error('no files provided');
    process.exit(1);
  } else if (process.argv.length < 4) {
    console.error('insufficient files provided');
    process.exit(1);
  } else {
    main(process.argv.slice(2)).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  }
}

async function main(filePaths: string[]): Promise<void> {
  // Ensure the last file is a "phases.json" file.
  const phasesFilePath = filePaths[filePaths.length - 1];
  if (basename(phasesFilePath).toLowerCase() !== 'phases.json') {
    throw new Error('no phases.json file');
  }

  // Read and parse the contents of all files.
  const fileContents = await Promise.all(filePaths.map((filePath) => readFile(filePath, 'utf-8')));

  // Pass the phase names and file contents to the processing function.
  const phaseNames = filePaths.map((filePath) => basename(filePath, '.json').toLowerCase());
  const output = await processPhases(phaseNames, fileContents);
  for (const line of output) {
    console.log(line);
  }
}

export async function processPhases(phaseNames: string[], fileContents: string[]): Promise<string[]> {
  // Create a dictionary mapping phase names to file contents.
  const dict = fileContents.reduce((p, _c, i) => {
    p[phaseNames[i]] = JSON.parse(fileContents[i]) as Stage[];
    return p;
  }, {} as { [name: string]: Stage[] });

  // Ensure the phases match the file names ignoring case.
  const phases = dict['phases'];
  if (phases === undefined) {
    throw new Error('phases not found');
  } else if (phases.length !== phaseNames.length - 1) {
    throw new Error('argument counts differ');
  } else if (phases.some((phase) => dict[phase.name.toLowerCase()] === undefined)) {
    throw new Error('missing phases');
  }

  // Sort the phases by prerequisites and check for circular dependencies.
  phases.sort(compare);
  validate(phases);

  // Sort the stages of each phase by prerequisites and check for circular dependencies.
  phases.forEach((phase) => {
    const stages = dict[phase.name.toLowerCase()];
    stages.sort(compare);
    validate(stages);
  });

  // Return the phases and stages.
  const output: string[] = [];
  phases.forEach((phase, phaseIndex) => {
    output.push(`${phaseIndex + 1} ${phase.name}`);
    const stages = dict[phase.name.toLowerCase()];
    output.push(...stages.map((stage, stageIndex) => `${phaseIndex + 1}.${stageIndex + 1} ${stage.name}`));
  });
  return output;

  // Compare two stages by checking their prerequisites.
  function compare(a: Stage, b: Stage): number {
    if (a.prerequisites.includes(b.name)) {
      // b is a prerequisite of a so a comes after it.
      return 1;
    } else if (b.prerequisites.includes(a.name)) {
      // a is a prerequisite of b so b comes after it.
      return -1;
    }

    // Neither is a prerequisite of the other so they are essentially equivalent.
    return 0;
  }

  // Validate the array of stages by checking if there is a violation of the prerequisites.  If there is, that means there is a
  // circular dependency.
  function validate(stages: Stage[]) {
    stages.forEach((stage, index) => {
      if (stage.prerequisites.some((prerequisite) => stages.slice(index).some((laterStage) => laterStage.name === prerequisite))) {
        throw new Error('circular dependency');
      }
    })
  }
}
