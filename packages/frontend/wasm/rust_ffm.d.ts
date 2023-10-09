/* tslint:disable */
/* eslint-disable */
/**
 * @returns {number}
 */
export function get_scale_length(): number
/**
 */
export class CosmoSim {
  free(): void
  /**
   * @param {number} n
   * @param {number} a
   * @param {number} M
   * @param {number} scale
   */
  constructor(n: number, a: number, M: number, scale: number)
  /**
   * @param {number} dt
   */
  simulate(dt: number): void
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} mass
   */
  insert_particle(x: number, y: number, z: number, mass: number): void
  /**
   * @returns {Float32Array}
   */
  get_position(): Float32Array
  /**
   * @returns {Float32Array}
   */
  get_velocity(): Float32Array
  /**
   * @returns {Float32Array}
   */
  get_mass(): Float32Array
}

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module

export interface InitOutput {
  readonly memory: WebAssembly.Memory
  readonly __wbg_cosmosim_free: (a: number) => void
  readonly cosmosim_new: (a: number, b: number, c: number, d: number) => number
  readonly cosmosim_simulate: (a: number, b: number) => void
  readonly cosmosim_insert_particle: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number
  ) => void
  readonly cosmosim_get_position: (a: number) => number
  readonly cosmosim_get_velocity: (a: number) => number
  readonly cosmosim_get_mass: (a: number) => number
  readonly get_scale_length: () => number
  readonly __wbindgen_exn_store: (a: number) => void
  readonly __wbindgen_free: (a: number, b: number, c: number) => void
  readonly __wbindgen_malloc: (a: number, b: number) => number
  readonly __wbindgen_realloc: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => number
}

export type SyncInitInput = BufferSource | WebAssembly.Module
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {SyncInitInput} module
 *
 * @returns {InitOutput}
 */
export function initSync(module: SyncInitInput): InitOutput

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?: InitInput | Promise<InitInput>
): Promise<InitOutput>
