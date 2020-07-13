/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import styled, { css } from 'styled-components';
import { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { useKeyDownEffect } from '../keyboard';

const rangeThumb = css`
  appearance: none;
  width: ${({ thumbSize = 16 }) => thumbSize}px;
  height: ${({ thumbSize = 16 }) => thumbSize}px;
  background-color: ${({ theme }) => theme.colors.fg.v1};
  cursor: pointer;
  border-radius: 50px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
`;

const focusedRangeThumb = css`
  background-color: ${({ theme }) => theme.colors.action};
`;

const Input = styled.input.attrs({
  type: 'range',
})`
  margin: 4px;
  min-width: 100px;
  cursor: pointer;
  outline: none;
  background: #fff4;
  border-radius: 100px;
  height: 4px;
  appearance: none;
  flex: 1;

  &::-webkit-slider-thumb {
    ${rangeThumb}
  }

  &::-moz-range-thumb {
    ${rangeThumb}
  }

  &::-ms-thumb {
    ${rangeThumb}
  }

  &:focus {
    &::-webkit-slider-thumb {
      ${focusedRangeThumb}
    }

    &::-moz-range-thumb {
      ${focusedRangeThumb}
    }

    &::-ms-thumb {
      ${focusedRangeThumb}
    }
  }
`;

/**
 * A styled range input component.
 *
 * This component must be initialized with two step values - one value (`majorStep`)
 * is the coarse value, that simply pressing arrow-left and arrow-right will move
 * between (e.g. 1) and the other (`minorStep`) is the more fine-grained value (e.g. 0.1)
 * which can be used by pressing shift+arrow.
 *
 * When using the mouse, only `minorStep` is considered and this is the resolution the
 * range has.
 *
 * @return {Node} Range input component
 */
function RangeInput({
  minorStep,
  majorStep,
  handleChange,
  value,
  min,
  max,
  ...rest
}) {
  const ref = useRef();
  const update = useCallback(
    (direction, isMajor) => {
      const diff = direction * (isMajor ? majorStep : minorStep);
      let val = value + diff;
      val = typeof min === 'number' ? Math.max(min, val) : val;
      val = typeof max === 'number' ? Math.min(max, val) : val;
      handleChange(val);
    },
    [minorStep, majorStep, handleChange, min, max, value]
  );

  useKeyDownEffect(ref, ['left'], () => update(-1, true), [update]);
  useKeyDownEffect(ref, ['right'], () => update(1, true), [update]);
  useKeyDownEffect(ref, ['shift+left'], () => update(-1, false), [update]);
  useKeyDownEffect(ref, ['shift+right'], () => update(1, false), [update]);
  return (
    <Input
      ref={ref}
      onChange={(evt) => handleChange(evt.target.valueAsNumber)}
      step={minorStep}
      value={value}
      min={min}
      max={max}
      {...rest}
    />
  );
}

RangeInput.propTypes = {
  handleChange: PropTypes.func.isRequired,
  minorStep: PropTypes.number.isRequired,
  majorStep: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
};

export default RangeInput;
