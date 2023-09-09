import { readFileSync } from 'fs';
import { basename } from 'path';
import { processPhases } from './process-phases';

describe('process phases', () => {
  const filePaths = ['construction.json', 'design.json', 'permitting.json', 'phases.json'];

  // Read and parse the contents of all files.
  const fileContents = filePaths.map((filePath) => readFileSync(filePath, 'utf-8'));

  // Extract the phase names from the file paths.
  const phaseNames = filePaths.slice(0, filePaths.length).map((filePath) => basename(filePath, '.json').toLowerCase());

  test('works as expected', async () => {
    const expectedOutput = [
      '1 Design',
      '1.1 Architectural',
      '1.2 Interior & Finishes',
      '1.3 Finalization & Estimates',
      '2 Permitting',
      '2.1 Documentation',
      '2.2 Submission',
      '2.3 City Comments',
      '3 Construction',
      '3.1 Foundation',
      '3.2 Electrical',
      '3.3 Structure',
      '3.4 Finishes',
    ];
    const actualOutput = await processPhases(phaseNames, fileContents);
    expect(actualOutput).toStrictEqual(expectedOutput);
  });

  test('fails if there are no arguments', async () => {
    try {
      await processPhases([], []);
      fail('unexpected success');
    } catch (err) {
      expect(err.message).toBe('phases not found');
    }
  });

  test("fails if the argument counts don't match", async () => {
    try {
      await processPhases(phaseNames.slice(1), fileContents);
      fail('unexpected success');
    } catch (err) {
      expect(err.message).toBe('argument counts differ');
    }
  });

  test("fails if there is invalid JSON", async () => {
    try {
      const modifiedFileContents = ['[{0}]'];
      modifiedFileContents.push(...fileContents.slice(1));
      await processPhases(phaseNames, modifiedFileContents);
      fail('unexpected success');
    } catch (err) {
      expect(err.message).toBe('Unexpected number in JSON at position 2');
    }
  });

  test("fails if there are missing phases", async () => {
    try {
      const modifiedPhaseNames = ['unspecified'];
      modifiedPhaseNames.push(...phaseNames.slice(1));
      const modifiedFileContents = ['[]'];
      modifiedFileContents.push(...fileContents.slice(1));
      await processPhases(modifiedPhaseNames, modifiedFileContents);
      fail('unexpected success');
    } catch (err) {
      expect(err.message).toBe('missing phases');
    }
  });

  test("fails if there is a circular dependency", async () => {
    try {
      const modifiedFileContents = [fileContents[0].replace('[]', '["Finishes"]')];
      modifiedFileContents.push(...fileContents.slice(1));
      await processPhases(phaseNames, modifiedFileContents);
      fail('unexpected success');
    } catch (err) {
      expect(err.message).toBe('circular dependency');
    }
  });
});
