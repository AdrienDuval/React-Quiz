import { act, useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import { type } from "@testing-library/user-event/dist/type";

const initialState = {
  questions: [],

  // 'loading', 'error', 'ready', "active", 'finished'
  status: 'loading',
}
function reducer(state, action) {
  switch (action.type) {
    case 'dataReceived':
      return {
        ...state, questions: action.payload, status: "ready",
      };

    case 'dataFailed':
      return { ...state, status: "error" };

    default:
      throw Error("Action unknown");
  }
}
export default function App() {

  const [{ questions, status }, dispatch] = useReducer(reducer, initialState);

  const numQuestions = questions.length;

  console.log(numQuestions);

  useEffect(function () {
    fetch("http://localhost:8000/questions").then((res) => res.json()).then(data => dispatch({ type: "dataReceived", payload: data })).catch(err => dispatch({ type: "dataFailed" }))
  }, []);

  return (
    <div className="app">
      <Header />

      <Main className="main">
        {status === "loading" && <div><Loader /></div>}
        {status === "error" && <Error />}
        {status === "ready" && <StartScreen numQuestions={numQuestions} />}
      </Main>
    </div >
  )
}