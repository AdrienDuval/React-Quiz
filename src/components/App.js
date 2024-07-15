import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishedScreen from "./FinishedScreen";

const initialState = {
  questions: [],

  // 'loading', 'error', 'ready', "active", 'finished'
  status: 'loading',
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
}
function reducer(state, action) {
  switch (action.type) {
    case 'dataReceived':
      return {
        ...state, questions: action.payload, status: "ready",
      };

    case 'dataFailed':
      return { ...state, status: "error" };
    case 'start':
      return { ...state, status: "active" };

    case 'newAnswer':
      const question = state.questions.at(state.index);

      return { ...state, answer: action.payload, points: action.payload === question.correctOption ? state.points + question.points : state.points, }

    case 'nextQuestion':
      // console.log("next question", state.index);
      return { ...state, index: state.index + 1, answer: null };
    case 'finish':

      return { ...state, status: "finished", index: 0, answer: null, highscore: state.points > state.highscore ? state.points : state.highscore }

    case 'restart':
      return { ...state, status: 'active', answer: null, points: 0, index: 0 }
    default:
      throw Error("Action unknown");
  }
}
export default function App() {

  const [{ questions, status, index, answer, points, highscore }, dispatch] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce((prev, cur) => prev + cur.points, 0)
  // console.log(numQuestions);

  useEffect(function () {
    fetch("http://localhost:8000/questions").then((res) => res.json()).then(data => dispatch({ type: "dataReceived", payload: data })).catch(err => dispatch({ type: "dataFailed" }))
  }, []);

  return (
    <div className="app">
      <Header />
      <Main className="main">
        <Progress index={index} numQuestions={numQuestions} points={points} maxPossiblePoints={maxPossiblePoints} answer={answer} />
        {status === "loading" && <div><Loader /></div>}
        {status === "error" && <Error />}
        {status === "ready" && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}

        {status === "active" && <Question question={questions[index]} dispatch={dispatch} answer={answer} />}
        <NextButton dispatch={dispatch} answer={answer} index={index} numQuestions={numQuestions} />

        {status === 'finished' && <FinishedScreen points={points} maxPossiblePoints={maxPossiblePoints} highscore={highscore} dispatch={dispatch} />}
      </Main>
    </div >
  )
}