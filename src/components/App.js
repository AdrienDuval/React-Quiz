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
import Footer from "./Footer";
import Timer from "./Timer";

const SECS_PER_QUESTION = 30;
const initialState = {
  questions: [],

  // 'loading', 'error', 'ready', "active", 'finished'
  status: 'loading',
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,

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
      return { ...state, status: "active", secondsRemaining: state.questions.length * SECS_PER_QUESTION };

    case 'newAnswer':
      const question = state.questions.at(state.index);

      return { ...state, answer: action.payload, points: action.payload === question.correctOption ? state.points + question.points : state.points, }

    case 'nextQuestion':
      // console.log("next question", state.index);
      return { ...state, index: state.index + 1, answer: null };
    case 'finish':

      return { ...state, status: "finished", index: 0, answer: null, highscore: state.points > state.highscore ? state.points : state.highscore }

    case 'restart':
      return { ...initialState, questions: state.questions, status: "ready" };

    case 'tick':
      return { ...state, secondsRemaining: state.secondsRemaining - 1, status: state.secondsRemaining === 0 ? "finished" : state.status, }
    default:
      throw Error("Action unknown");
  }
}
export default function App() {

  const [{ questions, status, index, answer, points, highscore, secondsRemaining }, dispatch] = useReducer(reducer, initialState);

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

        {status === "loading" && <div><Loader /></div>}
        {status === "error" && <Error />}
        {status === "ready" && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}

        {status === "active" &&
          <>
            <Progress index={index} numQuestions={numQuestions} points={points} maxPossiblePoints={maxPossiblePoints} answer={answer} />
            <Question question={questions[index]} dispatch={dispatch} answer={answer} />

            <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
            <NextButton dispatch={dispatch} answer={answer} index={index} numQuestions={numQuestions} />
          </>
        }

        {status === 'finished' && <FinishedScreen points={points} maxPossiblePoints={maxPossiblePoints} highscore={highscore} dispatch={dispatch} />}

      </Main>
    </div >
  )
}