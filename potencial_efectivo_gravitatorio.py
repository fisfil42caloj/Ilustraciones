from manim import *
import numpy as np


class PotencialEfectivoGravitatorio(Scene):
    """Escena intuitiva de potencial efectivo y órbita gravitatoria."""

    def construct(self):
        # Parámetros adimensionales (G M = 1, m = 1)
        l2 = 1.0
        e = 0.55  # excentricidad elíptica
        p = l2  # para potencial -1/r con mu=1
        energia_mecanica = -0.22
        r_min, r_max = 0.45, 7.0

        # --------------------- Panel izquierdo: potencial efectivo ---------------------
        axes = Axes(
            x_range=[0, 7, 1],
            y_range=[-1.2, 1.4, 0.4],
            x_length=6,
            y_length=4.2,
            axis_config={"include_numbers": True, "font_size": 22},
            tips=False,
        ).to_edge(LEFT, buff=0.45).shift(UP * 0.35)

        labels = axes.get_axis_labels(
            Tex("r").scale(0.7),
            Tex(r"V_{\mathrm{ef}}(r)").scale(0.7),
        )

        def v_ef(r):
            return -1 / r + l2 / (2 * r**2)

        pot_curve = axes.plot(v_ef, x_range=[r_min, r_max], color=BLUE_C)

        energy_line = axes.plot(
            lambda _: energia_mecanica,
            x_range=[r_min, r_max],
            color=YELLOW,
            stroke_width=4,
        )

        eq = MathTex(r"V_{\mathrm{ef}}(r)=\frac{L^2}{2mr^2}-\frac{GMm}{r}").scale(0.76)
        eq.next_to(axes, UP, buff=0.35)

        leyenda_pot = VGroup(
            Line(LEFT * 0.35, RIGHT * 0.35, color=BLUE_C, stroke_width=6),
            Tex("Potencial efectivo", font_size=30),
        ).arrange(RIGHT, buff=0.2)
        leyenda_E = VGroup(
            Line(LEFT * 0.35, RIGHT * 0.35, color=YELLOW, stroke_width=6),
            Tex("Energía mecánica $E$", font_size=30),
        ).arrange(RIGHT, buff=0.2)
        leyenda = VGroup(leyenda_pot, leyenda_E).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
        leyenda.scale(0.62).next_to(axes, DOWN, buff=0.2)

        turning_points = [
            p / (1 + e),
            p / (1 - e),
        ]
        turning_dots = VGroup(
            *[
                Dot(axes.c2p(rt, energia_mecanica), radius=0.06, color=ORANGE)
                for rt in turning_points
            ]
        )
        etiquetas_rt = VGroup(
            MathTex(r"r_{\min}", color=ORANGE).scale(0.55).next_to(turning_dots[0], DOWN),
            MathTex(r"r_{\max}", color=ORANGE).scale(0.55).next_to(turning_dots[1], DOWN),
        )

        # --------------------- Panel derecho: órbita ---------------------
        orbit_plane = NumberPlane(
            x_range=[-4, 4, 1],
            y_range=[-4, 4, 1],
            x_length=5.2,
            y_length=5.2,
            background_line_style={"stroke_opacity": 0.2, "stroke_width": 1},
            axis_config={"stroke_opacity": 0.4, "stroke_width": 1.5},
        ).to_edge(RIGHT, buff=0.5).shift(UP * 0.1)

        foco = Dot(orbit_plane.c2p(0, 0), color=RED, radius=0.08)
        foco_label = Tex("M", color=RED, font_size=34).next_to(foco, DOWN * 0.45)

        def r_of_theta(theta):
            return p / (1 + e * np.cos(theta))

        escala_orbita = 0.95

        def orb_point(theta):
            r = r_of_theta(theta)
            return orbit_plane.c2p(
                escala_orbita * r * np.cos(theta),
                escala_orbita * r * np.sin(theta),
            )

        orbit_path = ParametricFunction(
            lambda t: orb_point(t),
            t_range=[0, TAU],
            color=GREEN_C,
            stroke_width=4,
        )

        theta_tracker = ValueTracker(0.0)

        planeta = always_redraw(
            lambda: Dot(orb_point(theta_tracker.get_value()), color=WHITE, radius=0.07)
        )

        radio_vector = always_redraw(
            lambda: Line(foco.get_center(), planeta.get_center(), color=ORANGE, stroke_width=3)
        )

        r_label = always_redraw(
            lambda: MathTex("r", color=ORANGE)
            .scale(0.75)
            .move_to((foco.get_center() + planeta.get_center()) / 2 + UP * 0.2)
        )

        orbit_title = Tex("Órbita en el plano", font_size=32).next_to(orbit_plane, UP, buff=0.2)

        # Punto que conecta estado orbital con el potencial
        graph_dot = always_redraw(
            lambda: Dot(
                axes.c2p(r_of_theta(theta_tracker.get_value()), energia_mecanica),
                color=WHITE,
                radius=0.06,
            )
        )

        guide_line = always_redraw(
            lambda: DashedLine(
                axes.c2p(r_of_theta(theta_tracker.get_value()), axes.y_range[0]),
                axes.c2p(r_of_theta(theta_tracker.get_value()), energia_mecanica),
                color=GRAY_B,
                dash_length=0.08,
                stroke_width=2,
            )
        )

        subtitle = Tex(
            r"El radio oscila entre $r_{\min}$ y $r_{\max}$ mientras la órbita avanza.",
            font_size=28,
        ).to_edge(DOWN, buff=0.2)

        # --------------------- Animación ---------------------
        self.play(Create(axes), Write(labels), run_time=1.6)
        self.play(Write(eq), run_time=1)
        self.play(Create(pot_curve), Create(energy_line), FadeIn(leyenda), run_time=1.8)
        self.play(FadeIn(turning_dots), FadeIn(etiquetas_rt), run_time=0.8)

        self.play(Create(orbit_plane), Write(orbit_title), FadeIn(foco, foco_label), run_time=1.4)
        self.play(Create(orbit_path), run_time=1.6)
        self.play(FadeIn(planeta, radio_vector, r_label, graph_dot, guide_line), run_time=0.8)
        self.play(Write(subtitle), run_time=0.8)

        self.play(theta_tracker.animate.set_value(TAU), run_time=11, rate_func=linear)
        self.wait(1.2)
