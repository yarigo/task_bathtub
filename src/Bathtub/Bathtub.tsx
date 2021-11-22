import {
  forwardRef,
  FunctionComponent,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import useRecursiveTimeout from '../hooks/useRecursiveTimeout';
import './styles.css';

// Maximum water level.
const __MAX_LEVELS__ = 5;

type ReducerState = {
  increment: boolean;
  decrement: boolean;
  levels: JSX.Element[];
};

type ReducerActions =
  | { type: 'INCREMENT'; payload: boolean }
  | { type: 'DECREMENT'; payload: boolean }
  | { type: 'LEVELS'; payload: JSX.Element[] };

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        ...{ increment: action.payload, decrement: !action.payload },
      };
    case 'DECREMENT':
      return {
        ...state,
        ...{ decrement: action.payload, increment: !action.payload },
      };
    case 'LEVELS':
      return { ...state, ...{ levels: action.payload } };
    default:
      throw new Error();
  }
};

const initialState: ReducerState = {
  increment: false,
  decrement: false,
  levels: [],
};

interface BathtubProps {}

const Bathtub: FunctionComponent = forwardRef<HTMLDivElement, BathtubProps>(
  (_props, ref) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAction = useCallback(() => {
      if (state.increment) {
        if (state.levels.length < __MAX_LEVELS__) {
          dispatch({
            type: 'LEVELS',
            payload: [
              ...state.levels,
              <div key={state.levels.length} className='Bathtub-item' />,
            ],
          });
        }

        return;
      }

      if (state.decrement) {
        if (state.decrement && state.levels.length > 0) {
          const levels = [...state.levels];
          levels.pop();

          dispatch({ type: 'LEVELS', payload: levels });
        }
      }
    }, [state.levels, state.increment, state.decrement]);

    const { play, stop } = useRecursiveTimeout(handleAction);

    // Handle water levels.
    useEffect(() => {
      if (state.levels.length === 0 || state.levels.length === __MAX_LEVELS__) {
        stop();
      }
    }, [state.levels]);

    // Handle the `increaseWaterLevel` action.
    useEffect(() => {
      if (!state.increment) {
        return;
      }

      if (state.levels.length < __MAX_LEVELS__) {
        play();
      } else {
        stop();
      }
    }, [state.increment]);

    // Handle the `decreaseWaterLevel` action.
    useEffect(() => {
      if (!state.decrement) {
        return;
      }

      if (state.levels.length > 0) {
        play();
      } else {
        stop();
      }
    }, [state.decrement]);

    return (
      <div ref={ref} className='Bathtub-root'>
        <h3>Water level {state.levels.length}</h3>
        <div className='Bathtub-wrapper'>
          <div className='Bathtub-container'>
            <div className='Bathtub-items'>{state.levels}</div>
          </div>
          <div className='Bathtub-actions'>
            <button
              onClick={() => dispatch({ type: 'INCREMENT', payload: true })}
            >
              increaseWaterLevel
            </button>
            <button
              onClick={() => dispatch({ type: 'DECREMENT', payload: true })}
            >
              decreaseWaterLevel
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Bathtub.displayName = 'Bathtub';

export default Bathtub;
