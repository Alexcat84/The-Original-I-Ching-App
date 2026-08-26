/**
 * `renderHook` mínimo para probar hooks del shell nativo.
 *
 * POR QUÉ NO SE USA `@testing-library/react`:
 * el monorepo tiene dos copias de React (18.2.0 hoisted en la raíz, 19.2.3 en
 * apps/mobile). npm hoista `@testing-library/react` a la raíz, donde resuelve
 * react-dom 18 mientras el hook bajo prueba usa react 19. Dos copias de React
 * dejan el dispatcher en null y cualquier hook revienta con "Cannot read
 * properties of null (reading 'useState')". Ni los alias de Vite ni `dedupe` ni
 * inlinear la dependencia lo corrigen, porque la resolución ocurre dentro del
 * paquete ya externalizado.
 *
 * Este helper vive DENTRO de apps/mobile, así que sus imports de `react` y
 * `react-dom/client` resuelven a la misma copia 19.2.3 que usa el APK. El
 * problema desaparece en vez de mitigarse.
 *
 * `act` viene de `react` porque React 19 lo movió allí desde `react-dom/test-utils`.
 */

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

// React exige esta bandera para permitir `act` fuera de un runner propio.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export interface RenderHookResult<TResult, TProps> {
  /** `current` se reasigna en cada render, igual que en testing-library. */
  result: { current: TResult };
  rerender: (props: TProps) => void;
  unmount: () => void;
}

export function renderHook<TResult, TProps = undefined>(
  hook: (props: TProps) => TResult,
  options?: { initialProps?: TProps },
): RenderHookResult<TResult, TProps> {
  const result = { current: undefined as unknown as TResult };
  let props = options?.initialProps as TProps;

  function Probe(): null {
    result.current = hook(props);
    return null;
  }

  const container = document.createElement("div");
  document.body.appendChild(container);
  let root: Root;

  act(() => {
    root = createRoot(container);
    root.render(createElement(Probe));
  });

  return {
    result,
    rerender: (next: TProps) => {
      props = next;
      act(() => {
        root.render(createElement(Probe));
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

export { act };
