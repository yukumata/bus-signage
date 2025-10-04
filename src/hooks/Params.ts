import { useLocation } from "react-router-dom";

export const Params = () => {
  return new URLSearchParams(useLocation().search);
};
