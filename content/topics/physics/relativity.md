# Relativity

## Interstellar travel

@interstellar-travel

![A journey split into acceleration, cruise and braking, with ship and planet times](/images/relativity/travel.svg)

## Special and general relativity

![Special relativity uses flat spacetime; general relativity includes curvature](/images/relativity/overview.svg)

Special relativity deals with flat spacetime. The laws of physics and the speed of light in vacuum are the same in every inertial frame—a frame where a free object moves at constant velocity. There is no absolute state of rest.

General relativity describes gravity through spacetime curvature. Mass and energy affect the geometry, and freely falling objects follow geodesics through it.

Newtonian mechanics remains a good approximation at low speeds in weak gravity. Precise clocks can still pick up small relativistic effects.

## Special relativity

### Time and length

![At 0.6c: ship time is 4 years versus 5 on Earth; a 100 m ship measures 80 m](/images/relativity/time-length.svg)

The Lorentz factor sets the size of the special-relativistic effects:

$$
\gamma=\frac{1}{\sqrt{1-v^2/c^2}}, \qquad c=299{,}792{,}458\,\text{m/s}
$$

Here $v$ is the relative speed between inertial frames, with $|v|<c$. At $0.6c$, $\gamma=1.25$; at everyday speeds, $\gamma\approx1$.

For a clock moving at constant speed in the chosen inertial frame:

$$
\Delta t=\gamma\Delta\tau
$$

$\Delta\tau$ is the **proper time** recorded by the clock present at both events. Its own ticks remain normal; the longer interval $\Delta t$ belongs to the observer's frame.

Lengths along the direction of motion follow:

$$
L=\frac{L_0}{\gamma}
$$

$L_0$ is the length in the object's rest frame. Measuring $L$ requires both endpoints to be recorded simultaneously in the observer's frame. A photograph also includes light travel times, so its appearance is a separate issue.

At $0.6c$, 4 years onboard a ship correspond to 5 years in Earth's frame, and a 100 m ship measures 80 m along its motion. This assumes an inertial Earth frame and neglects gravity.

### Simultaneity

![The same flashes have different time coordinates in the beacon and ship frames](/images/relativity/simultaneity.svg)

Distant events can be simultaneous in one frame and occur at different times in another. This difference remains after accounting for light travel time; it is about event times, not when the light reaches someone's eyes.

For $S'$ moving along $S$'s positive $x$ axis at velocity $v$, with origins aligned at $t=t'=0$:

$$
x'=\gamma(x-vt), \qquad t'=\gamma\left(t-\frac{vx}{c^2}\right)
$$

**Two flashes, one light-year apart**

Beacons A and B are stationary in $S$ and flash at $t=0$ according to synchronized clocks. A ship moves from A toward B at $0.6c$, passing A at that instant. With $\gamma=1.25$, the flash events have these coordinates:

| Frame            | A: time, position      | B: time, position             |
| ---------------- | ---------------------- | ----------------------------- |
| Beacon frame $S$ | 0 years, 0 light-years | 0 years, 1 light-year         |
| Ship frame $S'$  | 0 years, 0 light-years | −0.75 years, 1.25 light-years |

The ship's frame assigns B's flash a time 0.75 years before A's. These times correspond to synchronized clocks throughout each frame. The 1.25-light-year coordinate difference is between events at different ship-frame times, not a simultaneous measurement of beacon separation.

**Spacetime interval: $\Delta s^2$**

![A light cone separates timelike, lightlike and spacelike events](/images/relativity/interval.svg)

The interval combines the time and position differences between two events:

$$
\Delta s^2=c^2\Delta t^2-\Delta x^2-\Delta y^2-\Delta z^2
$$

$c\Delta t$ is the distance light could travel during the time gap. Every term has units of length squared. Despite the superscript $2$, the interval is signed; some books reverse the overall sign.

- **Positive — timelike:** a slower-than-light object can connect the events. Their time order agrees in every inertial frame.
- **Zero — lightlike:** light can connect distinct events at different places and times.
- **Negative — spacelike:** no signal at or below $c$ can connect them. Their time order can differ between frames.

The flashes are spacelike. Using years and light-years, with $c=1$ light-year per year, both frames give the same interval:

$$
\Delta s^2=(0^2-1^2)\,\text{light-year}^2
=\bigl[(-0.75)^2-(1.25)^2\bigr]\,\text{light-year}^2
=-1\,\text{light-year}^2
$$

Time and position differences change; the interval stays fixed. For a timelike pair, an inertial clock connecting the events records $\Delta\tau=\sqrt{\Delta s^2}/c$. Accelerated paths require integrating proper time along the path.

**Why it matters**

There is no universal distant “now.” A question such as “What is happening on that planet right now?” needs a reference frame. Causality stays consistent: sending a message comes before receiving it in every inertial frame.

GPS makes this concrete by defining a frame and synchronized time standard for transmission and reception timestamps. [NIST: GPS receivers and relativity](https://nvlpubs.nist.gov/nistpubs/Legacy/TN/nbstechnicalnote1385.pdf). The travel widget likewise uses the planets' shared rest frame for destination time; all frames still agree on arrival and each clock's elapsed time.

### Velocity addition

![Two forward speeds of 0.6c combine to 0.882c; emitted light stays at c](/images/relativity/velocity.svg)

For motion along one axis, velocities combine as:

$$
u=\frac{u'+v}{1+u'v/c^2}
$$

$u'$ is the object's velocity in $S'$ and $u$ its velocity in $S$. Two forward velocities of $0.6c$ give about $0.882c$, rather than $1.2c$. Light stays at $c$: substituting $u'=c$ gives $u=c$.

### Energy and momentum

![Rest and kinetic energy at different speeds, compared with a massless photon](/images/relativity/energy.svg)

For a massive particle of invariant mass $m$ moving below $c$:

$$
E_0=mc^2, \qquad E=\gamma mc^2, \qquad K=(\gamma-1)mc^2, \qquad p=\gamma mv
$$

$E_0$ is rest energy, $E$ total energy, $K$ kinetic energy, and $p$ momentum magnitude. Keeping mass invariant avoids the ambiguity of “mass increases with speed.”

The broader relation is:

$$
E^2=p^2c^2+m^2c^4
$$

A photon has $m=0$ but still carries energy and momentum:

$$
p=\frac{E}{c}=\frac{h}{\lambda}
$$

Here $h$ is Planck's constant and $\lambda$ the wavelength. Substituting $m=0$ into $p=\gamma mv$ does not give the photon's momentum: at $v=c$, $\gamma$ is undefined, so that formula cannot be used. The energy–momentum relation still applies and gives $E=pc$.

For a massive particle, $K$ grows without bound as $v$ approaches $c$, so finite energy cannot bring it to light speed. At low speeds, $K\approx\frac12 mv^2$.

## General relativity

### Gravity as spacetime geometry

![A limited sphere analogy for geodesics and a freely orbiting satellite](/images/relativity/geometry.svg)

Spacetime combines where an event happens with when it happens. Mass and energy change the geometry that sets distances, elapsed times, and the paths of freely falling objects. This is the central idea behind gravity in general relativity. [NASA: General relativity and spacetime](https://science.nasa.gov/astrophysics/programs/physics-of-the-cosmos/general-relativity-and-the-nature-of-spacetime/).

A **geodesic** is the closest equivalent to a straight path in curved spacetime. A satellite with its engine off follows one while continually falling around Earth. Its orbit looks curved in space, but it is a free-fall path through spacetime.

The familiar rubber-sheet picture is only a rough analogy: time is part of the geometry too, and spacetime does not need an external downward pull to make objects move.

### Free fall and the equivalence principle

![Drifting, freely falling and supported cabins have different accelerometer readings](/images/relativity/free-fall.svg)

Inside a small, freely falling cabin, a released object floats beside the cabin rather than falling toward its floor. Both follow nearly the same free-fall motion. The same local behavior occurs in a cabin drifting far from gravity. This is the **equivalence principle**.

Weight on the ground comes from the floor preventing free fall. Astronauts in orbit feel weightless because they and their spacecraft fall together, even though Earth's gravity is still present.

The comparison is local. Two objects falling on opposite sides of Earth move toward different directions, both toward Earth's center. This difference between nearby free-fall paths is a **tidal effect**, a sign of spacetime curvature.

### Clocks and light

![Higher stationary clocks run faster; foreground mass bends light paths](/images/relativity/clocks-light.svg)

Gravity affects clock rates as well as motion. Near Earth, a stationary clock at higher altitude runs slightly faster than one below it. Each clock still ticks normally beside itself; the difference appears when their elapsed times are compared. More precisely, this depends on gravitational potential, rather than simply the strength of gravity at one point. [NIST: Relativity and optical clocks](https://www.nist.gov/publications/relativity-and-optical-clocks).

Light follows the geometry too, so its path can bend past a massive object even though photons have no rest mass. A local observer still measures vacuum light speed as $c$. The bending is **gravitational lensing**, not light locally slowing down. [NASA: How gravity warps light](https://science.nasa.gov/universe/stories/quick-reads/how-gravity-warps-light/).

### Practical uses

![Relativity connects to GPS timing, geodesy, lensing and gravitational-wave measurements](/images/relativity/applications.svg)

| Use                                     | Where general relativity enters                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GPS navigation**                      | Position comes from signal travel times, so satellite clocks must match the ground time standard. Gravity makes GPS clocks run about 45 microseconds per day faster; motion slows them by about 7. The net 38-microsecond daily offset needs correction. [NIST](https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test) |
| **Precision clocks and surveying**      | Height and gravitational potential affect clock rates. Precision time comparisons need these corrections; comparing optical clocks can also probe differences in gravitational potential for geodesy, an area of research. [NIST](https://www.nist.gov/publications/atomic-clock-performance-beyond-earth146s-gravitational-limit)                    |
| **Astronomy with gravitational lenses** | Foreground mass magnifies distant galaxies. Distorted images also help reconstruct the mass distribution, including dark matter. [NASA](https://science.nasa.gov/mission/hubble/science/science-highlights/shining-a-light-on-dark-matter/)                                                                                                           |
| **Gravitational-wave astronomy**        | Merging black holes produce ripples in spacetime. Comparing the measured signal with relativistic models reveals properties such as their masses, including systems that emit no detectable light. [LIGO](https://arxiv.org/abs/1602.03837)                                                                                                           |

GPS is the everyday engineering example. Clock comparisons connect the theory to precision measurement; lensing and gravitational waves turn it into tools for observing the universe.

The travel widget above uses special relativity in flat spacetime. Its acceleration does not by itself require general relativity, and it does not include gravitational clock effects near either planet.
