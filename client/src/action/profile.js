import axios from "axios";
import { setAlert } from "./alert";
import api from "../utils/api";

import { GET_PROFILE, PROFILE_ERRORE, UPDATE_PROFILE } from "./types";

//get current user profile
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get("api/profile/me");

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERRORE,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//create or update profile

export const createProfile = (formData, history, edit = false) => async (
  dispatch
) => {
  //try-catch
  try {
    //to post data
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    //make post request
    const res = await axios.post("api/profile", formData, config);

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });

    dispatch(
      setAlert(edit ? "Profile Updated." : "Profile Created", "success")
    );
    //redirect after
    if (!edit) {
      history.push("/dashboard");
    }
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: PROFILE_ERRORE,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Add Experience
export const addExperience = (formData, history) => async (dispatch) => {
  try {
    const res = await api.put("/profile/experience", formData);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert("Experience Added", "success"));

    history.push("/dashboard");
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({
      type: PROFILE_ERRORE,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Add Education
export const addEducation = (formData, history) => async (dispatch) => {
  try {
    const res = await api.put("/profile/education", formData);

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert("Education Added", "success"));

    history.push("/dashboard");
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({
      type: PROFILE_ERRORE,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};
