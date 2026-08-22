import { createSlice } from "@reduxjs/toolkit";
import type { JobStatus } from "../Interfaces/JobsInterfaces";
import { createJobThunk, deleteJobsThunk, getJobsByIdThunk, getJobsThunk, updateJobThunk } from "./jobsThunks";

const initialState: JobStatus = {
  jobs: [],
  jobById: null,
  getJobsStatus: "idle",
  getJobsError: undefined,
  getJobByIdStatus: "idle",
  getJobByIdError: undefined,
  createJobStatus: "idle",
  createJobError: undefined,
  updateJobStatus: "idle",
  updateJobError: undefined,
  deleteJobStatus: "idle",
  deleteJobError: undefined,
};

export const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearJobId(state) {
      state.jobById = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJobsThunk.pending, (state) => {
        state.getJobsStatus = "pending";
      })
      .addCase(getJobsThunk.fulfilled, (state, action) => {
        state.getJobsStatus = "fulfilled";
        state.jobs = action.payload;
        state.getJobsError = undefined;
      })
      .addCase(getJobsThunk.rejected, (state, action) => {
        state.getJobsStatus = "rejected";
        state.getJobsError = action.payload;
      })
      // GETBYID
      .addCase(getJobsByIdThunk.pending, (state) => {
        state.getJobByIdStatus = "pending";
      })
      .addCase(getJobsByIdThunk.fulfilled, (state, action) => {
        state.getJobByIdStatus = "fulfilled";
        state.jobById = action.payload;
        state.getJobByIdError = undefined;
      })
      .addCase(getJobsByIdThunk.rejected, (state, action) => {
        state.getJobByIdStatus = "rejected";
        state.getJobByIdError = action.payload;
      })
      // CREATE
      .addCase(createJobThunk.pending, (state) => {
        state.createJobStatus = "pending";
      })
      .addCase(createJobThunk.fulfilled, (state, action) => {
        state.createJobStatus = "fulfilled";
        state.jobById = action.payload;
        state.jobs.push(action.payload);
        state.createJobError = undefined;
      })
      .addCase(createJobThunk.rejected, (state, action) => {
        state.createJobStatus = "rejected";
        state.createJobError = action.payload;
      })
      // UPDATE
      .addCase(updateJobThunk.pending, (state) => {
        state.updateJobStatus = "pending";
      })
      .addCase(updateJobThunk.fulfilled, (state, action) => {
        state.updateJobStatus = "fulfilled";
        state.jobById = action.payload;
        const index = state.jobs.findIndex((job) => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        state.updateJobError = undefined;
      })
      .addCase(updateJobThunk.rejected, (state, action) => {
        state.updateJobStatus = "rejected";
        state.updateJobError = action.payload;
      })
      // DELETE
      .addCase(deleteJobsThunk.pending, (state) => {
        state.deleteJobStatus = "pending";
      })
      .addCase(deleteJobsThunk.fulfilled, (state, action) => {
        state.deleteJobStatus = "fulfilled";
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
        if (state.jobById?.id === action.payload) {
          state.jobById = null;
        }
        state.deleteJobError = undefined;
      })
      .addCase(deleteJobsThunk.rejected, (state, action) => {
        state.deleteJobStatus = "rejected";
        state.deleteJobError = action.payload;
      })
  },
});

export const { clearJobId } = jobSlice.actions;
export const jobReducer = jobSlice.reducer;
