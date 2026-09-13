# Basic Physics

Physics is the foundational science that investigates how the universe behaves — studying matter, energy, space, time, and the fundamental forces connecting them. This guide summarizes high-school level physics across five core branches: **Mechanics**, **Thermodynamics**, **Waves & Optics**, **Electromagnetism**, and **Modern/Atomic Physics**.

---

## 1. Mechanics

Mechanics studies the motion of physical bodies and the forces causing or changing that motion.

### 1.1 Kinematics (Describing Motion)

Kinematics describes motion without considering the forces causing it.

- **Position & Displacement ($\Delta x$)**: Net change in position, $\Delta x = x_f - x_i$.
- **Velocity ($v$)**: Rate of change of position, $v = \frac{\Delta x}{\Delta t}$ ($\text{m/s}$).
- **Acceleration ($a$)**: Rate of change of velocity, $a = \frac{\Delta v}{\Delta t}$ ($\text{m/s}^2$).

#### Kinematic Equations for Uniform Acceleration

When acceleration $a$ is constant:

$$
v = v_0 + at
$$

$$
x = v_0 t + \frac{1}{2}at^2
$$

$$
v^2 - v_0^2 = 2ax
$$

- $v_0$: initial velocity ($\text{m/s}$)
- $v$: final velocity ($\text{m/s}$)
- $x$: displacement ($\text{m}$)
- $a$: constant acceleration ($\text{m/s}^2$)
- $t$: elapsed time ($\text{s}$)

> [!TIP]
> **Purpose of $v^2 - v_0^2 = 2ax$:**
>
> - **Time-Independent**: Relates velocities, acceleration, and displacement in a single step without needing or calculating time $t$.
> - **Work-Energy Equivalence**: Multiplying both sides by $\frac{1}{2}m$ yields $\frac{1}{2}mv^2 - \frac{1}{2}mv_0^2 = (ma)x = Fx$ ($\Delta K = W$), showing it is the kinematic form of the Work-Energy Theorem.

---

### 1.2 Newton's Laws of Motion

Forces explain _why_ objects accelerate.

1. **Newton's First Law (Law of Inertia)**:
   An object remains at rest or continues to move at a constant velocity unless acted upon by a net external force ($\Sigma F = 0 \implies a = 0$).

2. **Newton's Second Law (Equation of Motion)**:
   The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass:

$$
\Sigma F = ma
$$

3. **Newton's Third Law (Action and Reaction)**:
   When body $A$ exerts a force on body $B$, body $B$ simultaneously exerts an equal and opposite force on body $A$:

$$
F_{A \to B} = -F_{B \to A}
$$

---

### 1.3 Friction and Normal Force

When surfaces touch, contact forces arise:

- **Normal force ($N$)**: Force perpendicular to the contact surface.
- **Static friction ($f_s$)**: Prevents relative motion up to a maximum threshold:

$$
f_s \le \mu_s N \quad (f_{s,\max} = \mu_s N)
$$

- **Kinetic friction ($f_k$)**: Opposes motion between sliding surfaces:

$$
f_k = \mu_k N \quad (\mu_k < \mu_s)
$$

---

### 1.4 Work, Energy, and Power

- **Work ($W$)**: Measure of energy transferred by a force acting over a displacement:

$$
W = F d \cos\theta
$$

- **Work-Energy Theorem**: The net work done on an object equals its change in kinetic energy:

$$
W_{\text{net}} = \Delta K = K_f - K_i
$$

- **Kinetic Energy ($K$)**:

$$
K = \frac{1}{2}mv^2
$$

- **Potential Energy ($U$)**:
  - Gravitational (near Earth's surface):
    $$U_g = mgh$$
  - Elastic (Hooke's Law spring, $F = -kx$):
    $$U_s = \frac{1}{2}kx^2$$

- **Conservation of Mechanical Energy**:
  In the absence of non-conservative forces (like friction), total mechanical energy is conserved:

$$
K_1 + U_1 = K_2 + U_2
$$

- **Power ($P$)**: Rate of doing work:

$$
P = \frac{W}{\Delta t} = F v \quad (\text{Watts, } 1\text{ W} = 1\text{ J/s})
$$

---

### 1.5 Momentum and Impulse

- **Linear Momentum ($p$)**: Quantity of motion of a moving body:

$$
p = mv
$$

- **Impulse ($I$)**: Product of average force and time duration, equal to change in momentum:

$$
I = F \Delta t = \Delta p = mv_f - mv_i
$$

- **Conservation of Momentum**:
  In an isolated system with no external net forces:

$$
m_1 v_{1i} + m_2 v_{2i} = m_1 v_{1f} + m_2 v_{2f}
$$

- **Coefficient of Restitution ($e$)**:

$$
e = -\frac{v_{1f} - v_{2f}}{v_{1i} - v_{2i}}
$$

- $e = 1$: Perfectly elastic collision (kinetic energy conserved).
- $0 < e < 1$: Inelastic collision.
- $e = 0$: Perfectly inelastic collision (objects stick together).

> [!TIP]
> **Real-Life Applications of Momentum & Impulse ($F\Delta t = \Delta p$):**
>
> - **Cushioning & Impact Reduction ($\Delta t \uparrow \implies F \downarrow$)**:
>   When stopping, the change in momentum $\Delta p$ is fixed. Extending collision duration $\Delta t$ reduces the peak impact force $F = \frac{\Delta p}{\Delta t}$:
>   - **Airbags & Crumple Zones**: Prolong collision time during a crash, preventing lethal impact forces on passengers.
>   - **Landing & Catching**: Bending your knees when landing or pulling your hand back when catching a baseball softens the blow.
>   - **Helmets & Packaging**: Bubble wrap and helmet foam compress under impact to stretch deceleration time and protect fragile contents.
> - **Maximizing Launch Velocity via Follow-Through ($\Delta t \uparrow \implies \Delta p \uparrow$)**:
>   In golf, baseball, and tennis, following through maintains contact with the ball slightly longer, imparting a larger impulse ($I = F\Delta t$) to maximize exit velocity.
> - **Rocket Propulsion**:
>   By expelling burned gas backward at high speed, conservation of momentum propels the rocket forward without needing air to push against.

---

### 1.6 Circular Motion and Gravitation

- **Uniform Circular Motion**:
  - Angular velocity: $\omega = \frac{\Delta \theta}{\Delta t}$ ($\text{rad/s}$)
  - Linear speed: $v = r\omega$
  - Period: $T = \frac{2\pi}{\omega} = \frac{2\pi r}{v}$
  - Centripetal acceleration (points toward the center):

$$
a_c = \frac{v^2}{r} = r\omega^2
$$

- Centripetal force:

$$
F_c = m a_c = m\frac{v^2}{r} = mr\omega^2
$$

> [!TIP]
> **Real-Life Applications of Centripetal Force ($F_c = m\frac{v^2}{r}$):**
>
> - **Speed Squared ($v^2$) Hazard on Highway Curves**:
>   Because required centripetal force scales with $v^2$, doubling your vehicle's speed through a curve demands **4 times** as much friction. If tires cannot supply $m\frac{v^2}{r}$, the car skids tangentially off the road.
> - **Banked Turns (Camber)**:
>   Highways, velodromes, and racetracks angle the road inward so the horizontal component of the normal force ($N\sin\theta$) provides centripetal force, allowing safe turns even on ice or wet pavement.
> - **Washing Machine Spin Cycles & Centrifuges**:
>   The spinning basket pushes clothes inward in a circle. Water droplets pass through holes because no inward force acts on them, escaping tangentially by inertia to dry the clothes.
> - **Roller Coaster Loop-the-Loops**:
>   At the top of a vertical loop, gravity and the track's normal force combine to provide centripetal force ($N + mg = m\frac{v^2}{r}$). To prevent falling, the cart must exceed a critical speed $v \ge \sqrt{gr}$. Modern coasters use teardrop-shaped (clothoid) loops to gradually change curvature radius $r$, avoiding dangerous g-force spikes.

- **Newton's Law of Universal Gravitation**:
  Every particle attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of the distance between them:

$$
F = G\frac{M m}{r^2}
$$

where $G \approx 6.674 \times 10^{-11}\,\text{N}\cdot\text{m}^2/\text{kg}^2$.

---

## 2. Thermodynamics

Thermodynamics examines heat, temperature, and their conversion to work and energy.

### 2.1 Heat and Temperature

- **Temperature ($T$)**: Measure of the average random kinetic energy of particles (Kelvin $\text{K} = {^\circ}\text{C} + 273.15$).
- **Heat Capacity & Specific Heat**:
  The heat $Q$ required to change the temperature of mass $m$ with specific heat $c$:

$$
Q = mc\Delta T = C\Delta T
$$

- **Latent Heat ($L$)**: Heat required for a phase transition without changing temperature:

$$
Q = mL
$$

---

### 2.2 Ideal Gas Law & Kinetic Theory

An ideal gas consists of point-like particles undergoing elastic collisions.

- **Equation of State (Ideal Gas Law)**:

$$
PV = nRT = N k_B T
$$

- $P$: pressure ($\text{Pa}$)
- $V$: volume ($\text{m}^3$)
- $n$: amount of substance ($\text{mol}$)
- $R \approx 8.314\,\text{J}/(\text{mol}\cdot\text{K})$: universal gas constant
- $N$: total number of gas particles/molecules (dimensionless)
- $k_B \approx 1.381 \times 10^{-23}\,\text{J/K}$: Boltzmann constant
- $N_A \approx 6.022 \times 10^{23}\,\text{mol}^{-1}$: Avogadro constant ($N = n N_A$, $R = N_A k_B$)

> [!TIP]
> **Understanding $nRT = N k_B T$ and Real-Life Applications:**
>
> - **What is $N$, and how many particles are in $1\text{ mol}$?**
>   - **$N$ is the actual count of microscopic gas particles (atoms or molecules)** in the volume, whereas **$n$ is the macroscopic amount of substance in moles**.
>   - **$1\text{ mol}$ contains $6.022 \times 10^{23}$ particles** (Avogadro's number, $N_A$). Much like a "dozen" means 12 items, a "mole" is a chemist's package of $6.022 \times 10^{23}$ particles.
>   - Because $N = n N_A$ and the gas constant per molecule is Boltzmann's constant ($k_B = R / N_A$), the macroscopic law ($nRT$) and microscopic law ($N k_B T$) are identical:
>     $$nRT = n(N_A k_B)T = (n N_A)k_B T = N k_B T$$
> - **Real-Life Applications of $PV = nRT$**:
>   - **Tire Pressure in Winter ($P \propto T$)**: As winter temperatures $T$ drop, internal tire pressure $P$ drops proportionally, triggering low-pressure warning lights. Driving warms the tires, recovering pressure.
>   - **Hot Air Balloons ($V \propto T \implies \text{density } \rho \downarrow$)**: Heating air inside the balloon causes thermal expansion; excess molecules escape, making the internal air less dense than surrounding cold air to generate lift.
>   - **Bags of Chips on Planes ($P \cdot V = \text{const}$)**: Sealed snack bags puff up at cruising altitude because cabin pressure $P$ is lower than sea-level pressure, allowing internal volume $V$ to expand. Similarly, scuba divers must exhale when ascending to prevent expanding air from injuring their lungs.
>   - **Pressure Cookers ($P \uparrow \implies T_{\text{boil}} \uparrow$)**: Trapping steam in a rigid pot ($V = \text{const}$) raises pressure $P$ to $\sim 2\text{ atm}$, raising water's boiling point to $\sim 120^\circ\text{C}$ and drastically reducing cooking time.

- **Average Kinetic Energy of a Molecule**:

$$
\bar{K} = \frac{1}{2}m\overline{v^2} = \frac{3}{2}k_B T
$$

- **Internal Energy ($U$) of a Monatomic Ideal Gas**:

$$
U = \frac{3}{2}nRT
$$

---

### 2.3 The First Law of Thermodynamics

Energy cannot be created or destroyed, only transformed:

$$
\Delta U = Q + W_{\text{on}} = Q - W_{\text{by}}
$$

- $Q$: heat added to the system ($Q > 0$ when absorbed)
- $W_{\text{by}} = P\Delta V$: work done by the gas during expansion

| Process                               | Condition          | Consequence                                 |
| :------------------------------------ | :----------------- | :------------------------------------------ |
| **Isochoric (constant volume)**       | $\Delta V = 0$     | $W = 0 \implies \Delta U = Q$               |
| **Isobaric (constant pressure)**      | $P = \text{const}$ | $W = P\Delta V$, $Q = \Delta U + P\Delta V$ |
| **Isothermal (constant temperature)** | $\Delta T = 0$     | $\Delta U = 0 \implies Q = W$               |
| **Adiabatic (no heat exchange)**      | $Q = 0$            | $\Delta U = -W$                             |

---

## 3. Waves & Optics

Waves transport energy through space and matter without transporting matter itself.

### 3.1 Wave Properties

- **Wavelength ($\lambda$)**: Distance between consecutive crests ($\text{m}$).
- **Frequency ($f$)**: Number of oscillations per second ($\text{Hz} = 1/\text{s}$).
- **Period ($T$)**: Time for one complete cycle ($T = 1/f$).
- **Wave Speed ($v$)**:

$$
v = f\lambda = \frac{\lambda}{T}
$$

- **Wave Classification**:
  - **Transverse wave**: Medium oscillates perpendicular to wave propagation (e.g., light, string waves).
  - **Longitudinal wave**: Medium oscillates parallel to wave propagation (e.g., sound waves).

---

### 3.2 Sound and the Doppler Effect

Sound is a mechanical longitudinal wave. The apparent frequency changes when source and observer are in relative motion:

$$
f' = f \left(\frac{V \pm v_o}{V \mp v_s}\right)
$$

- $V$: speed of sound in the medium ($\approx 340\,\text{m/s}$ in air at room temperature)
- $v_o$: observer velocity (positive when moving toward source)
- $v_s$: source velocity (positive when moving toward observer)

> [!TIP]
> **Real-Life Applications of the Doppler Effect ($f' = f \frac{V \pm v_o}{V \mp v_s}$):**
>
> - **Emergency Sirens & Race Cars**:
>   As an approaching ambulance approaches, sound waves compress in front of it, producing a higher pitch ($f' > f$). The moment it passes and moves away, the wave crests spread out, dropping the siren to a distinctly lower pitch ($f' < f$).
> - **Medical Doppler Ultrasound (Echocardiography)**:
>   Ultrasound pulses reflected off circulating red blood cells shift in frequency. Doctors measure this frequency difference ($\Delta f$) to calculate blood flow velocity, identify arterial blockages, and monitor fetal heartbeats.
> - **Meteorology (Doppler Weather Radar)**:
>   Radar pulses reflected by raindrops determine wind speed and precipitation movement inside storm clouds, enabling early detection of severe weather, tornado formation, and wind shear near airports.
> - **Police Speed Radar**:
>   Radar guns emit microwaves or laser pulses toward a moving vehicle. Comparing the frequency of the reflected signal to the emitted signal provides an immediate, precise reading of vehicle speed.
> - **Astronomy & the Expanding Universe (Redshift)**:
>   Light waves from stars and distant galaxies also exhibit the Doppler effect. Distant galaxies show light shifted toward longer, redder wavelengths (**redshift**), proving Edwin Hubble's discovery that the universe is continually expanding.

---

### 3.3 Geometric Optics

- **Law of Reflection**: Angle of incidence equals angle of reflection ($\theta_i = \theta_r$).
- **Snell's Law of Refraction**:
  When light passes between media of refractive indices $n_1$ and $n_2$:

$$
n_1 \sin\theta_1 = n_2 \sin\theta_2
$$

- **Total Internal Reflection & Critical Angle**:
  Occurs when light travels from a denser optical medium ($n_1 > n_2$) toward a rarer medium at an incident angle exceeding the critical angle $\theta_c$:

$$
\sin\theta_c = \frac{n_2}{n_1} \quad (n_1 > n_2)
$$

![Snell's Law of Refraction and Total Internal Reflection Diagram](/images/snell_law_refraction_tir.svg)

> [!TIP]
> **Real-Life Applications of Snell's Law & Total Internal Reflection:**
>
> - **Fiber Optic Internet**: Core networks transmit terabits of data per second across oceans and cities by trapping light pulses via total internal reflection inside a high-index silica core ($n_1 \approx 1.5$) enclosed by lower-index cladding ($n_2 \approx 1.45$).
> - **Medical Endoscopes**: Flexible fiber-optic bundles channel illumination deep inside organs and transmit clear optical images back via total internal reflection for minimally invasive diagnostics and surgeries.
> - **Diamond Brilliance & Fire**: Diamond has an exceptionally high refractive index ($n \approx 2.42$) and tiny critical angle ($\theta_c \approx 24.4^\circ$). Jewelers cut facets precisely so light entering from the crown reflects multiple times internally before emerging back out the top, maximizing sparkle.
> - **Automotive Rain-Sensing Wipers**: An infrared LED inside the windshield emits light at the glass-air critical angle, totally reflecting onto a detector. When raindrops strike the outside glass ($n_{\text{water}} > n_{\text{air}}$), light escapes into the droplets; the resulting intensity drop triggers the wipers automatically.
> - **Prism Binoculars & Periscopes**: High-end binoculars use $45^\circ$ glass prisms for total internal reflection instead of silvered mirrors, achieving 100% light reflection efficiency without absorption or degradation over time.
> - **Road Mirages (Inferior Mirage)**: On hot asphalt, near-ground air is hotter and less optically dense than higher air. Sky light curves continuously according to Snell's law until undergoing total internal reflection near the road, creating the illusion of a shimmering water puddle.

- **Thin Lens Equation**:

$$
\frac{1}{a} + \frac{1}{b} = \frac{1}{f}
$$

- $a$: object distance
- $b$: image distance ($b > 0$ real inverted image, $b < 0$ virtual upright image)
- $f$: focal length ($f > 0$ convex/converging lens, $f < 0$ concave/diverging lens)
- **Magnification**: $m = \frac{|b|}{a} = \frac{h'}{h}$

![Thin Lens Equation and Ray Diagram](/images/thin_lens_formula.svg)

> [!TIP]
> **Real-Life Applications of the Thin Lens Equation:**
>
> - **Cameras & Smartphones ($a > 2f \implies$ Miniaturized Real Image)**:
>   Camera lenses focus incoming light onto an electronic image sensor (CMOS) positioned at distance $b$, creating an inverted real image. Autofocus actuators adjust the lens position $b$ to keep subjects sharply focused.
> - **Magnifying Glasses & Eyepieces ($a < f \implies$ Magnified Virtual Image)**:
>   Placing an object inside the focal point ($a < f$) causes refracted rays to diverge. The human eye traces them backward to perceive an enlarged, upright virtual image ($b < 0$).
> - **The Human Eye (Accommodation)**:
>   The cornea and crystalline lens project an inverted real image onto the retina (where distance $b$ is fixed to the eyeball depth). Ciliary muscles compress the lens to change focal length $f$ for focusing between close books and distant horizons.
> - **Vision Correction (Eyeglasses & Contacts)**:
>   - **Myopia (Nearsightedness)**: Light focuses in front of the retina; corrected using a **diverging concave lens ($f < 0$)**.
>   - **Hyperopia & Presbyopia (Farsightedness / Reading Glasses)**: Light focuses behind the retina; corrected using a **converging convex lens ($f > 0$)**.

---

## 4. Electromagnetism

Electromagnetism governs interactions between electric charges and magnetic fields.

### 4.1 Electrostatics

- **Coulomb's Law**: Force between two point charges:

$$
F = k_e \frac{|q_1 q_2|}{r^2} \quad \left(k_e = \frac{1}{4\pi\varepsilon_0} \approx 9.0 \times 10^9\,\text{N}\cdot\text{m}^2/\text{C}^2\right)
$$

- **Electric Field ($E$)**: Force per unit charge:

$$
E = \frac{F}{q} = k_e \frac{Q}{r^2} \quad (\text{N/C or V/m})
$$

- **Electric Potential ($V$)**: Potential energy per unit charge:

$$
V = \frac{U_e}{q}, \quad V = Ed \text{ (uniform field)}
$$

- **Capacitance ($C$)**: Ability to store charge per volt:

$$
Q = CV \quad (\text{Farad, } 1\text{ F} = 1\text{ C/V})
$$

- **Stored Energy in Capacitor ($U$)**:

$$
U = \frac{1}{2}QV = \frac{1}{2}CV^2 = \frac{Q^2}{2C}
$$

#### Symbol Reference

| Symbol           | Physical Quantity                   | SI Unit                                                | Meaning & Relationship                                                                          |
| :--------------- | :---------------------------------- | :----------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| $F$              | Electrostatic Force (Coulomb force) | $\text{N}$ (Newton)                                    | Attractive or repulsive force between charges                                                   |
| $q, q_1, q_2, Q$ | Electric Charge                     | $\text{C}$ (Coulomb)                                   | Amount of electric charge (proton: $+e$, electron: $-e$)                                        |
| $r$              | Separation Distance                 | $\text{m}$ (meter)                                     | Straight-line distance between two point charges                                                |
| $k_e$ (or $k$)   | Coulomb's Constant                  | $\text{N}\cdot\text{m}^2/\text{C}^2$                   | $k_e = \frac{1}{4\pi\varepsilon_0} \approx 9.0 \times 10^9\,\text{N}\cdot\text{m}^2/\text{C}^2$ |
| $\varepsilon_0$  | Vacuum Permittivity                 | $\text{F/m}$ or $\text{C}^2/(\text{N}\cdot\text{m}^2)$ | Permittivity of free space ($\approx 8.854 \times 10^{-12}$)                                    |
| $E$              | Electric Field Strength             | $\text{N/C}$ or $\text{V/m}$                           | Force per unit positive charge ($F = qE$)                                                       |
| $V$              | Electric Potential (Voltage)        | $\text{V}$ (Volt) $= \text{J/C}$                       | Potential energy per unit positive charge ($U_e = qV$)                                          |
| $U_e$            | Electric Potential Energy           | $\text{J}$ (Joule)                                     | Energy possessed by charge $q$ in an electric field                                             |
| $d$              | Distance in Uniform Field           | $\text{m}$ (meter)                                     | Distance between parallel plates ($V = Ed \implies E = V/d$)                                    |
| $C$              | Capacitance                         | $\text{F}$ (Farad) $= \text{C/V}$                      | Charge storage capacity per volt of potential difference                                        |
| $U$              | Stored Capacitor Energy             | $\text{J}$ (Joule)                                     | Electrostatic energy stored in the electric field of capacitor                                  |

> [!TIP]
> **Intuition (Gravity Analogy) & Real-Life Usages of Electrostatics:**
>
> - **Intuitive Gravity Analogy**:
>   - Charge $q \longleftrightarrow$ Mass $m$
>   - Electric Field $E \longleftrightarrow$ Gravitational acceleration $g$ ($F = qE$ vs $F = mg$)
>   - Electric Potential $V \longleftrightarrow$ Height / Potential $gh$ ($U_e = qV$ vs $U_g = mgh$)
>   - Electric field $E$ represents the "slope" or steepness of the electric potential landscape ($E = V/d$). Positive charges naturally roll downhill from high $V$ to low $V$.
> - **Photocopiers & Laser Printers (Xerography)**:
>   A rotating photoconductive drum is electrostatically charged. A laser draws the image by neutralizing illuminated spots. Oppositely charged toner particles cling to the charged areas by Coulomb force ($F = qE$) and transfer onto paper before being baked into place.
> - **Capacitive Smartphone Touchscreens**:
>   A transparent conductive grid (ITO) holds an electrostatic field. Because human fingers conduct electricity, touching the glass alters the local capacitance ($\Delta C$). Microcontrollers measure the change across grid coordinates to detect touch position.
> - **Defibrillators (AEDs)**:
>   A capacitor slowly accumulates charge over several seconds, storing electrical energy ($U = \frac{1}{2}CV^2$). When activated, it discharges an intense, controlled electrical pulse (1,000–2,000 V in a few milliseconds) through the heart to reset fatal arrhythmias.
> - **Electrostatic Precipitators & Air Cleaners**:
>   Industrial smokestacks and home purifiers use high-voltage corona wires to ionize passing soot, pollen, and dust particles ($q$). Oppositely charged collector plates exert an electrostatic force ($F = qE$) that pulls pollutants out of the airflow.
> - **Lightning Rods & Faraday Cages**:
>   Charges concentrate intensely at sharp points ($E \propto 1/r$), causing corona discharge that bleeds cloud charge safely into the ground before lightning strikes. Inside a closed metal enclosure (Faraday cage), internal charges cancel out, creating an electric-field-free zone ($E = 0$) protecting avionics, cars, and lab equipment.

---

### 4.2 DC Circuits

- **Current ($I$)**: Charge passing through a cross-section per second: $I = \frac{\Delta Q}{\Delta t}$ ($\text{Ampere, A}$).
- **Ohm's Law**:

$$
V = IR
$$

- **Electric Power ($P$)**:

$$
P = VI = I^2 R = \frac{V^2}{R} \quad (\text{Watts, W})
$$

- **Combining Resistors**:
  - **Series**: $R_{\text{eq}} = R_1 + R_2 + \dots$
  - **Parallel**: $\frac{1}{R_{\text{eq}}} = \frac{1}{R_1} + \frac{1}{R_2} + \dots$

---

### 4.3 Magnetism & Electromagnetic Induction

- **Magnetic Force on Current-Carrying Wire**:

$$
F = I L B \sin\theta
$$

- **Lorentz Force on a Moving Charge**:

$$
f = q v B \sin\theta
$$

- **Faraday's Law of Electromagnetic Induction**:
  A changing magnetic flux induces an electromotive force (EMF, $V$):

$$
V = -N \frac{\Delta \Phi}{\Delta t}
$$

- $\Phi = B A \cos\theta$: magnetic flux ($\text{Weber, Wb}$)
- The negative sign reflects **Lenz's Law**: the induced current opposes the flux change that produced it.

#### Symbol Reference

| Symbol                 | Physical Quantity                             | SI Unit                                                                 | Meaning & Relationship                                                                                                          |
| :--------------------- | :-------------------------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| $F$                    | Magnetic Force on Wire (Laplace/Ampère force) | $\text{N}$ (Newton)                                                     | Net magnetic force experienced by all conduction electrons in a current-carrying wire ($F = I L B \sin\theta$)                  |
| $f$                    | Lorentz Force                                 | $\text{N}$ (Newton)                                                     | Magnetic force on an individual moving charged particle ($f = q v B \sin\theta$)                                                |
| $I$                    | Electric Current                              | $\text{A}$ (Ampere)                                                     | Flow rate of electric charge through the conductor                                                                              |
| $L$                    | Length of Conductor in Field                  | $\text{m}$ (meter)                                                      | Active length of wire immersed inside the magnetic field                                                                        |
| $B$                    | Magnetic Flux Density (Magnetic Field)        | $\text{T}$ (Tesla) $= \text{Wb/m}^2 = \text{N}/(\text{A}\cdot\text{m})$ | Concentration of magnetic field lines ($1\,\text{T}$ exerts $1\,\text{N}$ of force per meter on a $1\,\text{A}$ current)        |
| $\theta$               | Angle between Vectors                         | $\text{rad}$ or $^\circ$ (degrees)                                      | Angle between magnetic field $\vec{B}$ and current $\vec{I}$ (or velocity $\vec{v}$), or between field and normal to loop plane |
| $q$                    | Electric Charge                               | $\text{C}$ (Coulomb)                                                    | Electric charge of moving particle (proton: $+e$, electron: $-e$)                                                               |
| $v$                    | Particle Velocity                             | $\text{m/s}$                                                            | Velocity of the charged particle relative to the magnetic field (stationary charge $v=0$ feels no magnetic force)               |
| $V$ (or $\mathcal{E}$) | Induced Electromotive Force (EMF)             | $\text{V}$ (Volt)                                                       | Voltage induced across a closed loop by changing magnetic flux                                                                  |
| $N$                    | Number of Turns                               | Dimensionless (count)                                                   | Number of wire turns in the coil ($N$ turns multiply the induced EMF by $N$)                                                    |
| $\Phi$                 | Magnetic Flux                                 | $\text{Wb}$ (Weber) $= \text{T}\cdot\text{m}^2 = \text{V}\cdot\text{s}$ | Total measure of magnetic field passing through a given surface area ($\Phi = B A \cos\theta$)                                  |
| $A$ (or $S$)           | Loop Cross-Sectional Area                     | $\text{m}^2$                                                            | Surface area enclosed by the conducting coil                                                                                    |
| $\Delta t$             | Time Interval                                 | $\text{s}$ (second)                                                     | Duration of flux change (faster change / smaller $\Delta t$ induces higher EMF)                                                 |

![Principles of Magnetism and Electromagnetic Induction (Fleming's Left-Hand Rule and Lenz's Law Waveform Graph)](/images/electromagnetic_induction_lorentz.svg)

> [!TIP]
> **Physical Intuition (Fleming's Rules & Lenz's Law) & Real-Life Usages:**
>
> - **Fleming's Rules (Left Hand = Motor, Right Hand = Generator)**:
>   - **Left-Hand Rule (Electric Motors)**: Thumb = Force ($F$), Forefinger = Field ($B$), Middle finger = Current ($I$) ("FBI"). Inputting electrical current into a magnetic field produces physical motion and rotational torque.
>   - **Right-Hand Rule (Electric Generators)**: Thumb = Motion/Velocity ($v$), Forefinger = Field ($B$), Middle finger = Induced Current ($I$). Forcing a conductor to move across a magnetic field mechanically produces electric current.
> - **Lenz's Law & Conservation of Energy ("Nature Opposes Change")**:
>   - The minus sign in Faraday's Law ($V = -N \frac{\Delta \Phi}{\Delta t}$) represents **Lenz's Law**: the induced EMF creates an opposing magnetic field that actively fights against the change in magnetic flux.
>   - Push a north pole toward a coil, and the coil becomes an opposing north pole pushing back. Pull it away, and the coil becomes a south pole pulling it in.
>   - _Why?_ If the induced field assisted the change instead, a slight nudge of a magnet would cause runaway acceleration, generating infinite free electricity and violating the **Conservation of Energy**.
> - **Electric Motors (EVs, Home Appliances, Industrial Robotics)**:
>   Passing current through armature coils positioned inside strong magnetic fields produces continuous rotational torque via the Lorentz/Ampère force ($F = I L B \sin\theta$).
> - **Electric Power Generators (Hydro, Wind, Gas, Steam Turbines)**:
>   Rotating large coils through stationary magnetic fields (or rotating electromagnets past stator windings) continually varies $\Phi$, generating massive alternating voltages ($V = -N \frac{\Delta \Phi}{\Delta t}$) to power municipal electric grids.
> - **Induction Cooktops (IH Cooking)**:
>   A high-frequency AC coil underneath the ceramic cooktop produces a rapidly alternating magnetic field. This induces swirling **eddy currents** inside the ferromagnetic base of iron or stainless-steel cookware, heating the pan directly and instantaneously via internal Joule resistance ($P = I^2 R$) while keeping the cooktop cool.
> - **Contactless Transit Cards (Suica, Pasmo, NFC) & Qi Wireless Charging**:
>   The card reader transmits a high-frequency alternating magnetic flux. The miniature coil antenna embedded inside the thin plastic card captures this changing flux, inducing sufficient EMF via Faraday's Law to boot up the secure microcontroller chip and exchange encrypted data in milliseconds without any battery.
> - **Eddy Current Brakes (High-Speed Trains, Roller Coasters, Heavy Vehicles)**:
>   Electromagnets applied to spinning metal rotors induce eddy currents that oppose rotation according to Lenz's law. This produces frictionless, silent, non-wearing braking that naturally smooths out as rotation slows, eliminating brake fade and mechanical wear.
> - **Mass Spectrometry & Particle Accelerators (Cyclotrons)**:
>   Because Lorentz force ($f = q v B \sin\theta$) is always perpendicular to velocity, it performs zero mechanical work on the particle and acts purely as a centripetal force ($q v B = m \frac{v^2}{r} \implies r = \frac{mv}{qB}$). By measuring orbital radii $r$, scientists identify chemical isotopes and proteins with atomic precision.
> - **Loudspeakers & Dynamic Microphones**:
>   - **Loudspeaker**: Electrical audio current fed through a voice coil in a permanent magnetic field exerts an alternating Lorentz force ($F = I L B$) on a diaphragm cone, pushing air to generate sound.
>   - **Microphone**: Sound waves strike a diaphragm connected to a coil, moving it across a magnetic field to induce a matching electrical voltage signal (the exact physical inverse of a loudspeaker).

---

## 5. Modern & Atomic Physics

Modern physics explains phenomena at subatomic scales and near-light speeds.

### 5.1 Photons and the Photoelectric Effect

- **Photon Energy**: Light consists of quanta of energy:

$$
E = hf = \frac{hc}{\lambda}
$$

- $h \approx 6.626 \times 10^{-34}\,\text{J}\cdot\text{s}$: Planck's constant
- $c \approx 3.00 \times 10^8\,\text{m/s}$: speed of light

- **Einstein's Photoelectric Equation**:
  The maximum kinetic energy of emitted photoelectrons is:

$$
K_{\max} = hf - W_0
$$

where $W_0$ is the work function of the material.

---

### 5.2 Matter Waves & Mass-Energy Equivalence

- **De Broglie Wavelength**: Particles possess wave properties:

$$
\lambda = \frac{h}{p} = \frac{h}{mv}
$$

- **Mass-Energy Equivalence**:

$$
E = mc^2
$$

---

## 6. Key Formulas Cheat Sheet

| Branch               | Concept                    | Formula                                       | Key Units                               |
| :------------------- | :------------------------- | :-------------------------------------------- | :-------------------------------------- |
| **Mechanics**        | Velocity & Acceleration    | $v = v_0 + at$, $x = v_0 t + \frac{1}{2}at^2$ | $\text{m/s}$, $\text{m/s}^2$            |
| **Mechanics**        | Newton's Second Law        | $F = ma$                                      | $\text{N} = \text{kg}\cdot\text{m/s}^2$ |
| **Mechanics**        | Kinetic & Potential Energy | $K = \frac{1}{2}mv^2$, $U_g = mgh$            | $\text{J} = \text{N}\cdot\text{m}$      |
| **Mechanics**        | Momentum & Impulse         | $p = mv$, $I = F\Delta t = \Delta p$          | $\text{kg}\cdot\text{m/s}$              |
| **Mechanics**        | Centripetal Force          | $F_c = m\frac{v^2}{r} = mr\omega^2$           | $\text{N}$                              |
| **Mechanics**        | Universal Gravitation      | $F = G\frac{Mm}{r^2}$                         | $\text{N}$                              |
| **Thermodynamics**   | Specific Heat              | $Q = mc\Delta T$                              | $\text{J}$                              |
| **Thermodynamics**   | Ideal Gas Law              | $PV = nRT$                                    | $\text{Pa}$, $\text{m}^3$, $\text{K}$   |
| **Thermodynamics**   | First Law                  | $\Delta U = Q - W_{\text{by}}$                | $\text{J}$                              |
| **Waves**            | Wave Speed                 | $v = f\lambda$                                | $\text{m/s}$, $\text{Hz}$, $\text{m}$   |
| **Waves**            | Doppler Effect             | $f' = f\frac{V \pm v_o}{V \mp v_s}$           | $\text{Hz}$                             |
| **Optics**           | Snell's Law                | $n_1 \sin\theta_1 = n_2 \sin\theta_2$         | dimensionless                           |
| **Optics**           | Thin Lens Equation         | $\frac{1}{a} + \frac{1}{b} = \frac{1}{f}$     | $\text{m}$                              |
| **Electromagnetism** | Coulomb's Law              | $F = k_e \frac{\|q_1 q_2\|}{r^2}$             | $\text{N}$, $\text{C}$                  |
| **Electromagnetism** | Ohm's Law & Power          | $V = IR$, $P = VI = I^2 R$                    | $\text{V}$, $\text{A}$, $\text{W}$      |
| **Electromagnetism** | Lorentz Force              | $F = qvB\sin\theta$                           | $\text{N}$, $\text{T}$                  |
| **Electromagnetism** | Faraday's Law              | $V = -N\frac{\Delta\Phi}{\Delta t}$           | $\text{V}$, $\text{Wb}$                 |
| **Modern Physics**   | Photon Energy              | $E = hf = \frac{hc}{\lambda}$                 | $\text{J}$ or $\text{eV}$               |
| **Modern Physics**   | Mass-Energy Equivalence    | $E = mc^2$                                    | $\text{J}$                              |
