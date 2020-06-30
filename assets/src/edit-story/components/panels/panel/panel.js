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
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Internal dependencies
 */
import { useGlobalKeyDownEffect } from '../../keyboard';
import panelContext from './context';

export const PANEL_COLLAPSED_THRESHOLD = 10;

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  position: relative;
`;

function Panel({
  resizeable,
  canCollapse,
  initialHeight,
  name,
  shortcut,
  onExpand,
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandToHeight, setExpandToHeight] = useState(initialHeight);
  const [height, setHeight] = useState(initialHeight);
  const [manuallyChanged, setManuallyChanged] = useState(false);
  const wrapperRef = useRef(null);

  const collapse = useCallback(() => {
    if (!canCollapse) {
      return;
    }
    setIsCollapsed(true);
    if (resizeable) {
      setHeight(0);
    }
  }, [resizeable, canCollapse]);
  const expand = useCallback(
    (restoreHeight = true) => {
      setIsCollapsed(false);
      if (restoreHeight && resizeable) {
        setHeight(expandToHeight);
      }
      if (onExpand) {
        onExpand();
      }
    },
    [resizeable, expandToHeight, onExpand]
  );

  useEffect(() => {
    setIsCollapsed(!canCollapse);
    expand(true);
  }, [canCollapse, expand]);

  useEffect(() => {
    if (resizeable && height <= PANEL_COLLAPSED_THRESHOLD && !isCollapsed) {
      collapse();
    }
  }, [collapse, height, resizeable, isCollapsed]);

  useEffect(() => {
    if (manuallyChanged || !resizeable) {
      return;
    }
    setHeight(initialHeight);
    setExpandToHeight(initialHeight);
  }, [manuallyChanged, initialHeight, resizeable]);

  // Set a keyboard shortcut that opens this panel
  useGlobalKeyDownEffect(
    shortcut ? { key: [shortcut] } : null,
    (evt) => {
      // Cancel the default behavior of the event if any
      evt.preventDefault();

      expand();
      wrapperRef.current.scrollIntoView({
        inline: 'center',
        behavior: 'smooth',
      });
    },
    [shortcut, wrapperRef, expand]
  );

  const manuallySetHeight = useCallback(
    (h) => {
      if (!resizeable) {
        return;
      }
      setManuallyChanged(true);
      setHeight(h);
      if (isCollapsed && h(height) > PANEL_COLLAPSED_THRESHOLD) {
        expand(false);
      }
    },
    [setManuallyChanged, setHeight, height, expand, resizeable, isCollapsed]
  );

  const resetHeight = useCallback(() => {
    setManuallyChanged(false);
    if (isCollapsed) {
      expand(true);
    }
  }, [expand, isCollapsed]);

  const panelContentId = `panel-${name}-${uuidv4()}`;

  const contextValue = {
    state: {
      height,
      resizeable,
      isCollapsed,
      panelContentId,
    },
    actions: {
      setHeight: manuallySetHeight,
      setExpandToHeight,
      collapse,
      expand,
      resetHeight,
    },
  };

  const ContextProvider = panelContext.Provider;

  return (
    <Wrapper ref={wrapperRef}>
      <ContextProvider value={contextValue}>{children}</ContextProvider>
    </Wrapper>
  );
}

Panel.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string.isRequired,
  initialHeight: PropTypes.number,
  resizeable: PropTypes.bool,
  canCollapse: PropTypes.bool,
  shortcut: PropTypes.string,
  onExpand: PropTypes.func,
};

Panel.defaultProps = {
  initialHeight: null,
  resizeable: false,
  canCollapse: true,
};

export default Panel;
