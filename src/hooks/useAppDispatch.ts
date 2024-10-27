// client/src/hooks/useAppDispatch.ts
import {useDispatch} from "react-redux";
import type {AppDispatch} from "../store";

const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
