# Relativity

## Interstellar travel

@interstellar-travel

## Special and general relativity

Special relativity deals with flat spacetime. The laws of physics and the speed of light in vacuum are the same in every inertial frame—a frame where a free object moves at constant velocity. There is no absolute state of rest.

General relativity describes gravity through spacetime curvature. Mass and energy affect the geometry, and freely falling objects follow geodesics through it.

Newtonian mechanics remains a good approximation at low speeds in weak gravity. Precise clocks can still pick up small relativistic effects.

## Time and length

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

## Simultaneity

The part behind “each observer measures the other's clock as slow” is that the two frames disagree about which distant events are simultaneous.

For $S'$ moving at velocity $v$ along $S$'s positive $x$ axis, with origins aligned at $t=t'=0$:

$$
x'=\gamma(x-vt), \qquad t'=\gamma\left(t-\frac{vx}{c^2}\right)
$$

The transverse coordinates stay unchanged. Even when $\Delta t=0$, the other frame can have $\Delta t'=-\gamma v\Delta x/c^2$.

The **spacetime interval** stays invariant:

$$
\Delta s^2=c^2\Delta t^2-\Delta x^2-\Delta y^2-\Delta z^2
$$

With this sign convention:

- **Timelike** ($\Delta s^2>0$): a slower-than-light object can connect the events. Their time order agrees in every inertial frame.
- **Lightlike** ($\Delta s^2=0$): light in vacuum can connect them.
- **Spacelike** ($\Delta s^2<0$): no signal at or below $c$ can connect them. Their time order can differ between frames.

## Velocity addition

For motion along one axis, velocities combine as:

$$
u=\frac{u'+v}{1+u'v/c^2}
$$

$u'$ is the object's velocity in $S'$ and $u$ its velocity in $S$. Two forward velocities of $0.6c$ give about $0.882c$, rather than $1.2c$. Light stays at $c$: substituting $u'=c$ gives $u=c$.

## Energy and momentum

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
