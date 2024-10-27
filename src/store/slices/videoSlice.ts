// client/src/store/slices/videoSlice.ts
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface VideoStream {
  id: string;
  url: string;
  // Add other relevant properties for a video stream
}

interface VideoState {
  streams: VideoStream[];
}

const initialState: VideoState = {
  streams: [],
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    addStream(state, action: PayloadAction<VideoStream>) {
      state.streams.push(action.payload);
    },
    clearStreams(state) {
      state.streams = [];
    },
  },
});

export const {addStream, clearStreams} = videoSlice.actions;
export default videoSlice.reducer;
