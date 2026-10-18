import { useId, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { calculateInterstellarTravel } from "../utils/interstellarTravel";

const copy = {
  en: {
    title: "Interstellar travel",
    intro:
      "Start at rest, accelerate, cruise, then brake to rest at the destination.",
    speed: "Maximum speed (% of c)",
    duration: "Acceleration / braking (years each)",
    distance: "Distance (light-years)",
    durationNote:
      "Each phase uses this many years on the planet clocks to reach or leave the speed limit.",
    ship: "Time aboard the ship",
    planet: "Time at the destination",
    years: "years",
    phase: "Phase",
    shipClock: "Ship years",
    planetClock: "Planet years",
    accelerate: "Accelerate",
    cruise: "Cruise",
    brake: "Brake",
    peak: "Peak speed",
    short:
      "Too close to reach the speed limit. Acceleration ends halfway and braking begins immediately; both phases are shorter than requested.",
    model: "Model and clock reference",
    assumptions:
      "Departure and destination are stationary in the same inertial frame. Distance and the acceleration input use that frame. Constant proper acceleration (the acceleration felt aboard), with equal braking; gravity, fuel limits, and planet motion ignored. For a short route, the same acceleration is kept and the peak speed is reduced.",
    timing:
      "Destination time is the elapsed time from the synchronized departure time to arrival, not the wait for a light signal reporting departure.",
    source: "Constant proper acceleration equations",
    errors: {
      speed: "Enter a maximum speed greater than 0 and less than 100% of c.",
      duration: "Enter a positive acceleration duration in years.",
      distance: "Enter a positive distance in light-years.",
      range:
        "These values exceed the calculator's numerical range. Try less extreme inputs.",
    },
  },
  jp: {
    title: "恒星間の移動時間",
    intro: "静止状態から加速し、巡航後に減速して目的地で停止。",
    speed: "最高速度（光速の %）",
    duration: "加速・減速の時間（各区間の年数）",
    distance: "距離（光年）",
    durationNote:
      "最高速度までの加速と、そこからの減速にそれぞれかける時間。惑星側の時計で指定。",
    ship: "船内で経過する時間",
    planet: "目的地で経過する時間",
    years: "年",
    phase: "区間",
    shipClock: "船内の年数",
    planetClock: "惑星側の年数",
    accelerate: "加速",
    cruise: "巡航",
    brake: "減速",
    peak: "到達する最高速度",
    short:
      "距離が短いため、指定した最高速度には到達しない。中間点で加速から減速に切り替わり、両区間とも指定時間より短くなる。",
    model: "計算モデルと時計の基準",
    assumptions:
      "出発地と目的地は同じ慣性系で静止。距離と加速時間は惑星側の基準。船内で感じる加速度は一定とし、減速時も同じ大きさ。重力・燃料の制約・惑星の運動は無視。短距離では加速度を維持し、到達速度を下げる。",
    timing:
      "目的地の時間は、同期した出発時刻から到着までの経過時間。出発を知らせる光信号の受信時刻が基準ではない。",
    source: "一定の固有加速度での運動の式",
    errors: {
      speed: "最高速度は光速の 0% より大きく、100% 未満。",
      duration: "加速時間には 0 より大きい年数が必要。",
      distance: "距離には 0 より大きい光年数が必要。",
      range: "数値計算の範囲外。極端に大きい値や小さい値を避ける。",
    },
  },
};

export default function InterstellarTravel() {
  const { language } = useLanguage();
  const text = copy[language];
  const id = useId();
  const [speed, setSpeed] = useState("1");
  const [duration, setDuration] = useState("1");
  const [distance, setDistance] = useState("4.24");
  const { result, error } = calculateInterstellarTravel({
    maxSpeedPercent: Number(speed),
    accelerationYears: Number(duration),
    distanceLightYears: Number(distance),
  });
  const format = (value: number) =>
    new Intl.NumberFormat(language === "jp" ? "ja-JP" : "en-US", {
      maximumFractionDigits: 3,
      ...(value > 0 && value < 0.001
        ? { notation: "scientific", maximumFractionDigits: 2 }
        : {}),
    }).format(value);
  const formatSpeed = (value: number) =>
    new Intl.NumberFormat(language === "jp" ? "ja-JP" : "en-US", {
      maximumSignificantDigits: value > 99.999 ? 16 : 6,
    }).format(value);
  const inputs = [
    { name: "speed", label: text.speed, value: speed, set: setSpeed, max: 100 },
    {
      name: "duration",
      label: text.duration,
      value: duration,
      set: setDuration,
    },
    {
      name: "distance",
      label: text.distance,
      value: distance,
      set: setDistance,
    },
  ];

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="max-w-3xl rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/50"
    >
      <h3
        id={`${id}-title`}
        className="text-xl font-semibold text-neutral-950 dark:text-neutral-100"
      >
        {text.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        {text.intro}
      </p>
      <div className="mt-5 grid items-end gap-4 sm:grid-cols-3">
        {inputs.map((input) => (
          <div key={input.name}>
            <label
              htmlFor={`${id}-${input.name}`}
              className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              {input.label}
            </label>
            <input
              id={`${id}-${input.name}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={input.max}
              step="any"
              required
              value={input.value}
              onChange={(event) => input.set(event.target.value)}
              aria-invalid={error === input.name}
              aria-describedby={
                error === input.name
                  ? `${id}-error`
                  : input.name === "duration"
                    ? `${id}-duration-note`
                    : undefined
              }
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>
        ))}
      </div>
      <p
        id={`${id}-duration-note`}
        className="mt-3 text-xs leading-5 text-neutral-500 dark:text-neutral-400"
      >
        {text.durationNote}
      </p>
      <div aria-live="polite" aria-atomic="true" className="mt-5">
        {error ? (
          <p
            id={`${id}-error`}
            className="text-sm text-red-700 dark:text-red-400"
          >
            {text.errors[error]}
          </p>
        ) : (
          <>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                [text.ship, result.shipYears],
                [text.planet, result.planetYears],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950"
                >
                  <dt className="text-sm text-neutral-600 dark:text-neutral-400">
                    {label}
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold tabular-nums text-neutral-950 dark:text-neutral-100">
                    {format(Number(value))}{" "}
                    <span className="text-base font-normal">{text.years}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">
              {text.peak}: {formatSpeed(result.peakSpeedPercent)}% c
            </p>
            {!result.reachesMaxSpeed && (
              <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-300">
                {text.short}
              </p>
            )}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm tabular-nums text-neutral-700 dark:text-neutral-300">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      {text.phase}
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      {text.shipClock}
                    </th>
                    <th scope="col" className="py-2 pl-3 font-medium">
                      {text.planetClock}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      text.accelerate,
                      result.rampShipYears,
                      result.rampPlanetYears,
                    ],
                    [
                      text.cruise,
                      result.cruiseShipYears,
                      result.cruisePlanetYears,
                    ],
                    [text.brake, result.rampShipYears, result.rampPlanetYears],
                  ].map(([phase, ship, planet]) => (
                    <tr key={phase}>
                      <th scope="row" className="py-2 pr-3 font-normal">
                        {phase}
                      </th>
                      <td className="px-3 py-2">{format(Number(ship))}</td>
                      <td className="py-2 pl-3">{format(Number(planet))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <details className="mt-5 border-t border-neutral-200 pt-4 text-xs leading-5 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        <summary className="cursor-pointer font-medium">{text.model}</summary>
        <p className="mt-3">{text.assumptions}</p>
        <p className="mt-2">{text.timing}</p>
        <a
          className="mt-2 inline-block underline underline-offset-2"
          href="https://math.ucr.edu/home/baez/physics/Relativity/SR/Rocket/rocket.html"
        >
          {text.source}
        </a>
      </details>
    </section>
  );
}
