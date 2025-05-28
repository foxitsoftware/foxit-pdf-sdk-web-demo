const { fork } = require('child_process');
const path = require('path');

/**
 * Simple task management to keep track of conversion tasks. This is for demo purpose only.
 *
 * Each conversion task is run in a child process.
 * And the task status is keep in the parent process.
 * The child process will send message to the parent process to update the task status.
 * An interval timer is used to check the task status and clean up the task if it is not accessed for a long time.
 */

// a map of conversion tasks, indexed by task id (the output file path is used as the task id here)
const tasks = {};

function startTask(taskId, { srcFilePath, outputFilePath, password, convertType, params }) {
  // run conversion in a child process to avoid blocking the main thread
  const workerPath = path.join(__dirname, 'conversion-worker.js');
  const child = fork(workerPath, [
    JSON.stringify({
      srcFilePath,
      outputFilePath,
      password,
      convertType,
      params,
    }),
  ]);

  const task = {
    status: 'running', // running, stopped, finished, error
    progress: null, // in the form of 'converted_count/total_count'
    percentage: 0, // percentage of progress, range from 0 to 100
    error: null, // the error message if the task status is error
    process: child, // the process that runs the conversion
    startTimestamp: new Date().getTime(),
    lastAccessTimestamp: new Date().getTime(),
  };
  tasks[taskId] = task;

  child.on('message', (data) => {
    const message = JSON.parse(data);
    switch (message.status) {
      case 'finished':
        task.status = 'finished';
        break;
      case 'error':
        task.status = 'error';
        task.error = message.error;
        break;
      case 'running':
        task.status = 'running';
        task.progress = message.progress;
        task.percentage = message.percentage;
        break;
    }
  });
  child.on('exit', (code, signal) => {
    //stopTask(taskId);
    if (code !== 0 && task.status === 'running') {
      task.status = 'error';
      task.error = "Unknown conversion error.";
    }
    console.log(`task ${taskId} exited with code ${code}`);
  });
  return taskId;
}

function stopTask(taskId) {
  const task = tasks[taskId];
  if (task) {
    task.process.kill();
    task.status = 'stopped';
  }
}

function getTaskInfo(taskId) {
  const task = tasks[taskId];
  if (task) {
    return {
      status: task.status,
      progress: task.progress,
      percentage: task.percentage,
      error: task.error,
    };
  }
  return null;
}

function updateTaskAccessTimestamp(taskId) {
  if (tasks[taskId]) {
    tasks[taskId].lastAccessTimestamp = new Date().getTime();
  }
}

// check task status periodically, and clean up the task based on certain conditions
// current condition: if the task is not accessed for 30 seconds, clean up the task
setInterval(() => {
  console.log('== tasks report ==');
  Object.keys(tasks).forEach((taskId) => {
    console.log(
      `task ${taskId} status: ${tasks[taskId].status}, percentage: ${tasks[taskId].percentage}`,
    );
    // if the task is not accessed for 30 seconds, clean up the task
    if (new Date().getTime() - tasks[taskId].lastAccessTimestamp > 30 * 1000) {
      stopTask(taskId);
      delete tasks[taskId];
      console.log(`task ${taskId} is cleaned up`);
    }
  });
}, 15000);

module.exports = {
  startTask,
  stopTask,
  getTaskInfo,
  updateTaskAccessTimestamp,
};
