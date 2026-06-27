"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;

const { promises: fsp } = require('fs');

const details = () => ({
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
exports.details = details;

const plugin = async (args) => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const { mtimeMs } = args.originalLibraryFile.statSync;

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
    await fsp.utimes(
      args.inputFileObj._id,
      mtimeMs / 1000,
      mtimeMs / 1000,
    );
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
exports.plugin = plugin;
