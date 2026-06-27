import { promises as fsp } from 'fs';
import os from 'os';
// eslint-disable-next-line import/no-unresolved,import/no-extraneous-dependencies
import touch from 'touch';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = ():IpluginDetails => ({
  name: 'Keep Original File Dates And Times',
  description: 'Copies the original file dates and times to the working file '
    + 'after transcoding, so the output keeps the source mtime/ctime instead '
    + 'of the time it was processed.',
  style: {
    borderColor: 'green',
  },
  tags: 'post-processing,dates,date',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'Timestamps updated to match source',
    },
    {
      number: 2,
      tooltip: 'Timestamps already matched source, no update needed',
    },
    {
      number: 3,
      tooltip: 'Timestamp update failed',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args:IpluginInputArgs):Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const { mtimeMs, ctimeMs } = args.originalLibraryFile.statSync;

  let currentMtimeMs;
  try {
    currentMtimeMs = (await fsp.stat(args.inputFileObj._id)).mtimeMs;
  } catch (err) {
    args.jobLog(`Unable to stat working file: ${err}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 3,
      variables: args.variables,
    };
  }

  if (currentMtimeMs === mtimeMs) {
    args.jobLog('Timestamps already match source, skipping update');
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 2,
      variables: args.variables,
    };
  }

  try {
    if (os.platform() === 'win32') {
      await fsp.utimes(
        args.inputFileObj._id,
        ctimeMs / 1000,
        mtimeMs / 1000,
      );
    } else {
      touch.sync(args.inputFileObj._id, { mtimeMs, force: true });
    }
  } catch (err) {
    args.jobLog(`Failed to update timestamps: ${err}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 3,
      variables: args.variables,
    };
  }

  args.jobLog('Timestamps updated to match source');
  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};
