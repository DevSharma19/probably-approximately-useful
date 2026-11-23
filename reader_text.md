# Reader text: Probably Approximately Useful

Plain prose from every page, for editing. Left out: definition, theorem, lemma, corollary, and example boxes; proofs; images and figures; the notation table; widgets; and display math (each removed equation is marked [display math]). Inline math is kept. Each `<!-- ===== file ===== -->` line marks the page the text below it comes from.

---

<!-- ===== index.html ===== -->

# Probably Approximately Useful

*VC dimension and the Fundamental Theorem of PAC Learning*

Computational learning theory is a distinctive model within complexity theory. It asks what a *learner* can learn from labeled examples. Can it label new examples correctly? How many examples does it need?

We start with an example from [David Abel](https://david-abel.github.io/blog/posts/learning_theory.html). Alice is teaching Boris English. She starts with the word "banana".

1. Alice points at a banana and says "banana". Boris does not know what the word means. It could mean yellow, fruit, curved, or banana.
2. She points at a second banana, an old brown one. This rules out yellow. Boris now wonders about brown or rotten.
3. She shows more bananas: green, ripe, tiny, spotty. Each one rules out more guesses. Only "banana" fits them all.
4. Boris sees a banana he has never seen before. He labels it himself, and he is right.

Boris's guesses form a **hypothesis class**. Each example rules out the guesses that disagree with it. Boris has learned when he labels a new example correctly.

The main application is machine learning. The question we care about most is how many examples a learner needs. The answer depends on the hypothesis class $\mathcal{H}$, and in particular on whether it is finite or infinite.

For a finite class $\mathcal{H}$, about $\log|\mathcal{H}|/\varepsilon$ examples suffice. But most useful classes are infinite. Thresholds on $\mathbb{R}$ already have infinitely many hypotheses, and they are easy to learn.

The right measure of size is the **VC dimension**. The main result of this site is the Fundamental Theorem of PAC Learning: a class is learnable from finitely many samples **if and only if** its VC dimension is finite. The last chapter asks the complexity theorist's question: when is learning also *efficient*?

## Who this is for

Students who have taken 15-455 (Undergraduate Complexity Theory). We assume comfort with proofs, asymptotic notation, and basic discrete probability (union bound, expectation, concentration). No machine learning background is needed.

## Chapters

1. [Learning from Samples](chapters/1-pac.html): the PAC model and finite hypothesis classes
2. [Shattering & VC Dimension](chapters/2-vc-dimension.html): measuring the size of infinite classes (interactive)
3. [The Sauer–Shelah Lemma](chapters/3-sauer-shelah.html): from exponential to polynomial (interactive)
4. [Uniform Convergence](chapters/4-uniform-convergence.html): why empirical error tracks true error
5. [The Fundamental Theorem](chapters/5-fundamental-theorem.html): finite VC dimension ⇔ PAC learnable
6. [Beyond](chapters/6-beyond.html): connections to complexity theory, recent results, and deep learning

Scroll down to read the whole site in one go, or jump to a chapter from the bar at the top.

<!-- ===== chapters/1-pac.html ===== -->

# 1. Learning from Samples

## The setup

A **domain** $\mathcal{X}$, labels $\{0,1\}$, and an unknown distribution $\mathcal{D}$ over *labeled examples* $\mathcal{X} \times \{0,1\}$. The learner sees a sample $S = ((x_1, y_1), \dots, (x_m, y_m))$ drawn i.i.d. from $\mathcal{D}$, and outputs a hypothesis $h : \mathcal{X} \to \{0,1\}$. It chooses $h$ from a fixed **hypothesis class** $\mathcal{H}$.

The learner does not know $\mathcal{D}$. It only sees $S$.

$L_{\mathcal{D}}(h)$ is what we care about. $L_S(h)$ is what the learner can compute.

Some hypothesis in the class labels everything correctly. Then $L_S(h^\star) = 0$ with probability 1. Chapters 1–3 assume realizability. Chapter 4 drops it.

The definition has three parts.

- **Approximately correct:** the error is at most $\varepsilon$.
- **Probably:** this holds with probability at least $1 - \delta$. Some failure is unavoidable. For example, every sample point could be the same $x$.
- **Distribution-free:** one function $m_{\mathcal{H}}$ works for every $\mathcal{D}$. The sample size cannot depend on $\mathcal{D}$.

The role of $\delta$ matches the error probability of a randomized algorithm in RP or BPP.

## Empirical Risk Minimization

$\mathrm{ERM}_{\mathcal{H}}$ outputs any $h \in \mathcal{H}$ that minimizes $L_S(h)$. Under realizability, $L_S(h^\star) = 0$, so ERM outputs some $h$ with $L_S(h) = 0$. Such an $h$ is *consistent* with $S$.

The sample cost grows with description length.

Now, consider thresholds on $\mathbb{R}$: $h_t(x) = \mathbb{1}[x \ge t]$ for $t \in \mathbb{R}$. This class is infinite, so the bound above says nothing. Therefore, $\ln|\mathcal{H}|$ is the wrong measure of size. Chapter 2 defines the right one.

<!-- ===== chapters/2-vc-dimension.html ===== -->

# 2. Shattering & VC Dimension

A learner only sees finitely many points. So what matters is how many ways $\mathcal{H}$ can label a finite set, not how many hypotheses it has.

Example: thresholds on $C = \{1, 2, 3\}$ give $\mathcal{H}_C = \{000, 001, 011, 111\}$. That is 4 labelings out of 8.

If $\mathcal{H}$ shatters $C$, labels on part of $C$ say nothing about labels on the rest. Chapter 5 turns this into a lower bound.

To show $\mathrm{VCdim}(\mathcal{H}) = d$, prove two things:

1. *Some* set of size $d$ is shattered.
2. *No* set of size $d+1$ is shattered.

## The shattering game

Place points and pick a class. The widget checks all $2^n$ labelings.

- Find 4 points that rectangles shatter. Then add a fifth.
- Find 3 points that halfplanes shatter. Why do 4 points always fail?
- Place 7 points on a circle and select convex polygons.

## Examples

Each class below is described by a few real parameters. Thresholds have one parameter, $t$. Intervals have two, $a$ and $b$. Halfplanes have three: $w_1$, $w_2$, and $b$. Rectangles have four. In each case the VC dimension equals the number of parameters. This suggests that VC dimension counts the degrees of freedom of a class. Convex polygons have no bound on their number of vertices, and their VC dimension is infinite. The last example shows that the parameter count can still be misleading.

<!-- ===== chapters/3-sauer-shelah.html ===== -->

# 3. The Sauer–Shelah Lemma

Chapter 2 asked whether $\mathcal{H}$ can realize every labeling of one set. This chapter asks how many labelings it can realize on $m$ points, as a function of $m$. That count, not $|\mathcal{H}|$, controls how many samples a learner needs.

## The growth function

The maximum is over all sets of $m$ points. So $\tau_{\mathcal{H}}(m)$ is a worst case. It is the largest number of distinct behaviors $\mathcal{H}$ can show on $m$ points.

Two simple bounds hold.

- $\tau_{\mathcal{H}}(m) \le 2^m$, since $m$ points have only $2^m$ labelings. Equality holds exactly when some $m$-point set is shattered, that is, when $m \le \mathrm{VCdim}(\mathcal{H})$.
- $\tau_{\mathcal{H}}(m) \le |\mathcal{H}|$, since each labeling comes from at least one hypothesis. So the growth function is never worse than the count from Chapter 1.

Both classes are infinite, yet both growth functions are polynomials in $m$. The degree matches the VC dimension: 1 for thresholds, 2 for intervals. The Sauer–Shelah lemma says this always happens.

## The lemma

Read the bound as a count. $\binom{m}{i}$ is the number of subsets of size $i$. So the sum counts the subsets of an $m$-point set with at most $d$ elements. For fixed $d$, this is $O(m^d)$. The form $(em/d)^d$ is less exact but easier to use in calculations.

There is no middle ground. If $\mathrm{VCdim}(\mathcal{H}) = \infty$, then $\tau_{\mathcal{H}}(m) = 2^m$ for every $m$. If $\mathrm{VCdim}(\mathcal{H}) = d$, then $\tau_{\mathcal{H}}(m)$ is at most a polynomial of degree $d$. So every growth function is either $2^m$ for all $m$ or polynomially bounded.

The bound is tight. Thresholds and intervals meet it with equality, since $m + 1 = \binom{m}{0} + \binom{m}{1}$ and $\binom{m+1}{2} + 1 = \binom{m}{0} + \binom{m}{1} + \binom{m}{2}$. So does the class of indicators of sets with at most $d$ elements: on any $m$ points, it realizes exactly the subsets of size at most $d$.

## The growth plot

The y-axis is $\log_2$, so $2^m$ is a straight line. The Sauer–Shelah bound equals $2^m$ for $m \le d$. After $m = d$ it bends away and grows like $m^d$. On this scale its slope keeps shrinking, while the slope of $2^m$ stays fixed. So the gap between them grows exponentially. Change $d$ to see where the bend happens.

## Proof

The proof counts shattered subsets instead of labelings. It charges each labeling of $C$ to a different shattered subset of $C$. Every shattered subset has at most $d$ elements, so it only remains to count small subsets.

The claim implies the lemma. If $\mathrm{VCdim}(\mathcal{H}) \le d$, every shattered $B$ has $|B| \le d$. There are $\sum_{i=0}^{d}\binom{m}{i}$ subsets of $C$ of size at most $d$.

The induction removes one point $c_1$. Labelings of $C$ that differ only at $c_1$ merge into one labeling of the remaining points. We count the merged labelings and the merged pairs separately. Each count is a smaller instance of the claim.

## Why this matters

Chapter 1 bounded the sample size by $\ln(|\mathcal{H}|/\delta)/\varepsilon$. Its proof used a union bound over every hypothesis in $\mathcal{H}$. For infinite $\mathcal{H}$ that union bound is useless.

On a fixed sample, two hypotheses with the same labels look identical. So a union bound only needs one hypothesis per labeling. Chapter 4 makes this precise using a second sample, so the count becomes $\tau_{\mathcal{H}}(2m)$. Compare the two quantities: [display math] The right side is finite whenever $d$ is finite. It grows only logarithmically in $m$, while the sample size grows linearly. So for large enough $m$ the sample wins. This is why finite VC dimension gives learnability.

<!-- ===== chapters/4-uniform-convergence.html ===== -->

# 4. Uniform Convergence

## Dropping realizability

Now remove the realizability assumption. The labels may be noisy, or no hypothesis in $\mathcal{H}$ may be perfect. We can no longer ask for error $\le \varepsilon$. Instead, we ask to be nearly as good as the best hypothesis in the class.

When realizability holds, $\min_{h'} L_{\mathcal{D}}(h') = 0$ and this is exactly PAC learnability from Chapter 1.

## Uniform convergence

ERM works when the empirical error $L_S(h)$ is close to the true error $L_{\mathcal{D}}(h)$ for *every* $h \in \mathcal{H}$ at the same time, not just for one fixed $h$.

So if $\mathcal{H}$ has the uniform convergence property, ERM is an agnostic PAC learner with $m_{\mathcal{H}}(\varepsilon,\delta) \le m^{UC}_{\mathcal{H}}(\varepsilon/2, \delta)$. Take $m \ge m^{UC}_{\mathcal{H}}(\varepsilon/2,\delta)$. With probability at least $1-\delta$, $S$ is $\frac{\varepsilon}{2}$-representative, and the lemma applies.

## Why one hypothesis is not enough

Fix $h$ before seeing $S$. Then $L_S(h)$ is an average of $m$ i.i.d. indicators with mean $L_{\mathcal{D}}(h)$. Hoeffding's inequality gives [display math] This does not apply to $h_S$, because $h_S$ is chosen after seeing $S$. For finite $\mathcal{H}$, a union bound over all of $\mathcal{H}$ gives uniform convergence with $m^{UC}_{\mathcal{H}}(\varepsilon,\delta) \le \left\lceil \frac{\ln(2|\mathcal{H}|/\delta)}{2\varepsilon^2} \right\rceil$. Infinite classes need another idea.

## Finite VC dimension ⇒ uniform convergence

The finite-class bound fails for infinite $\mathcal{H}$ because its union bound runs over infinitely many hypotheses. But most of those hypotheses are redundant on any given sample. Two hypotheses that label $S$ the same way have the same empirical error. So on a sample of size $m$, $\mathcal{H}$ shows at most $\tau_{\mathcal{H}}(m)$ distinct behaviors. Let $d = \mathrm{VCdim}(\mathcal{H})$. By Sauer–Shelah, that is at most $(em/d)^d$ once $m \ge d$. We would like to replace $|\mathcal{H}|$ in the union bound with this number.

There is one catch. The true error $L_{\mathcal{D}}(h)$ depends on $h$ everywhere, not only on the sample. Two hypotheses that agree on $S$ can have different true errors. The fix is to draw a second, independent sample $S'$ of the same size, called a *ghost sample*. If $L_S(h)$ is far from $L_{\mathcal{D}}(h)$, then it is likely also far from $L_{S'}(h)$. Both of these errors depend only on the $2m$ points in $S$ and $S'$. On those points, $\mathcal{H}$ has at most $\tau_{\mathcal{H}}(2m)$ behaviors. This is why $\tau_{\mathcal{H}}(2m)$ appears in the result below.

The proof is beyond the scope of this discussion. It follows the ghost-sample idea above. See Vapnik and Chervonenkis (1971), or Anthony and Bartlett (1999), Theorem 4.3.

Compare the two bounds on the probability that some $h$ is far from its true error: [display math] The constants are worse. But the size of the class, $|\mathcal{H}|$, is replaced by the number of behaviors on $2m$ points. When $d$ is finite, that number is polynomial in $m$, and the exponential term wins.

A finer argument (chaining) removes the $\log(1/\varepsilon)$ factor. This gives $O\big((d + \log(1/\delta))/\varepsilon^2\big)$, which is optimal.

## Putting the pieces together

We now have every piece of one direction of the main theorem. Each chapter supplied one link:

1. **Chapter 2:** VC dimension measures the size of a class by the largest set it shatters.
2. **Chapter 3:** if the VC dimension is $d$, the growth function is at most $(em/d)^d$, a polynomial in $m$.
3. **Chapter 4:** a polynomial growth function gives uniform convergence, by the VC inequality.
4. **Chapter 4:** uniform convergence makes ERM an agnostic PAC learner, by the "Representative ⇒ ERM succeeds" lemma. Under realizability, the same learner is a PAC learner.

So finite VC dimension implies PAC learnability. This is the *sufficiency* half of the Fundamental Theorem.

The other half is *necessity*: if the VC dimension is infinite, no learner succeeds. Chapter 2 already contains the idea. If $\mathcal{H}$ shatters a set $C$, then labels on part of $C$ say nothing about the rest. Chapter 5 turns this into a proof, called the No Free Lunch theorem. It then combines both halves into the Fundamental Theorem.

<!-- ===== chapters/5-fundamental-theorem.html ===== -->

# 5. The Fundamental Theorem of PAC Learning

The sample complexity depends on $\mathcal{H}$ only through $d$. Noise costs a factor of about $1/\varepsilon$.

## Roadmap

The proof is a cycle of implications. Each arrow is either a result from an earlier chapter or immediate from the definitions.

- **6 ⇒ 1:** Sauer–Shelah plus the VC inequality (Chapters 3–4).
- **1 ⇒ 2:** the "Representative ⇒ ERM succeeds" lemma (Chapter 4).
- **2 ⇒ 3** and **5 ⇒ 4:** by definition.
- **3 ⇒ 4** and **2 ⇒ 5:** under realizability, $\min_h L_{\mathcal{D}}(h) = 0$. So an agnostic guarantee is a realizable guarantee.
- **4 ⇒ 6:** No Free Lunch (below).

## Sufficiency: finite VC ⇒ learnable

Let $\mathrm{VCdim}(\mathcal{H}) = d < \infty$. Chapter 4 gives uniform convergence with $m^{UC}_{\mathcal{H}}(\varepsilon,\delta) = O\big((d\log(1/\varepsilon) + \log(1/\delta))/\varepsilon^2\big)$. So ERM is an agnostic PAC learner with $m_{\mathcal{H}}(\varepsilon,\delta) \le m^{UC}_{\mathcal{H}}(\varepsilon/2,\delta)$.

In the realizable case we can do better. ERM outputs a consistent $h$. We only need that no bad $h$ is consistent. The ghost-sample argument from Chapter 4 adapts to this event:

With Sauer–Shelah, this is at most $\delta$ for $m = O\big((d\log(1/\varepsilon) + \log(1/\delta))/\varepsilon\big)$. This matches the upper bound in the quantitative theorem.

## Necessity: infinite VC ⇒ not learnable

Idea: put $\mathcal{D}$ on a set $C$ of $2m$ points. The sample misses at least half of $C$. On the missed points, the labels can be anything. The learner has no information about them.

The same argument with a shattered set of size $d$ shows $m_{\mathcal{H}} \ge d/2$ for small constant $\varepsilon, \delta$. The full lower bound $\Omega\big((d + \log(1/\delta))/\varepsilon\big)$ is due to Ehrenfeucht, Haussler, Kearns, and Valiant (1989).

<!-- ===== chapters/6-beyond.html ===== -->

# 6. Beyond: Connections to Complexity Theory

The Fundamental Theorem counts *samples*, not *time*. It says when a learner can succeed with few examples. It does not say whether a learner can find a good hypothesis quickly. This chapter connects learning to the rest of complexity theory. It states results without proof and points to the sources.

## Efficient learnability

To talk about running time, the domain needs a size. Let $\mathcal{X}_n = \{0,1\}^n$ and let $\mathcal{H}_n$ be a class over $\mathcal{X}_n$. Each $h \in \mathcal{H}_n$ has a description of size $\mathrm{size}(h)$, such as the length of a formula.

Under realizability, ERM must solve the consistency problem. So the complexity of ERM is the complexity of this search problem.

### Hardness for every output format

Some classes are hard to learn even improperly. Then the hardness rests on assumptions from cryptography or average-case complexity, not on $\mathrm{P} \ne \mathrm{NP}$ alone. The common idea: if a class can compute pseudorandom functions, an efficient learner would distinguish them from random functions.

- **Kearns and Valiant (1994).** Assuming problems such as breaking RSA are hard, Boolean formulas, deterministic finite automata, and constant-depth threshold circuits are not efficiently PAC learnable.
- **Klivans and Sherstov (2009).** A polynomial-time learner for intersections of $n^{\varepsilon}$ halfspaces would solve certain approximate lattice problems in the worst case. The reduction uses Regev's lattice-based cryptosystems.
- **Daniely and Shalev-Shwartz (2016).** Assuming that refuting random $K$-SAT formulas is hard, DNF formulas with $\omega(\log n)$ terms are not efficiently learnable. It was one of the first hardness-of-learning results based on an assumption other than cryptography.

## Recent results on sample complexity

The Fundamental Theorem left some questions open. Recent work answers several of them.

This removes the $\log(1/\varepsilon)$ factor from Chapter 5 and matches the lower bound. Hanneke's learner is not plain ERM. It runs ERM on many subsamples and takes a majority vote. Larsen (2023) showed that bagging, a standard method from practice, is also optimal.

A compression scheme keeps a few sample points and rebuilds a consistent hypothesis from them. Littlestone and Warmuth (1986) showed that compression implies learnability. Moran and Yehudayoff showed the converse: learnability implies compression. Whether size $O(d)$ always suffices was left open.

Always $\mathrm{VCdim}(\mathcal{H}) \le \mathrm{Ldim}(\mathcal{H})$. The gap can be infinite: thresholds on $\mathbb{R}$ have VC dimension 1 but infinite Littlestone dimension. Finite Littlestone dimension characterizes *online* learning, where examples arrive one at a time and the learner must predict each label.

An algorithm is *differentially private* if changing one example changes its output distribution only slightly. So thresholds on $\mathbb{R}$ are PAC learnable but not privately PAC learnable. Privacy needs a stronger property than finite VC dimension.

## Limitations: deep learning

Neural networks are the most successful learners in practice. The theory on this site explains their success poorly.

So VC bounds call for more samples than there are weights. Modern networks have far more weights than training examples. Zhang et al. (2017) showed that such networks can fit training data with *random* labels. So the class can realize essentially any labeling of the training set, and VC bounds say nothing. Yet on real labels the same networks generalize well.

- **Uniform convergence may not be enough.** Nagarajan and Kolter (2019) gave settings where overparameterized models trained by gradient descent generalize, but every two-sided uniform convergence bound is nearly vacuous. This holds even after accounting for the implicit bias of gradient descent.
- **Double descent.** Belkin, Hsu, Ma, and Mandal (2019) observed that test error can fall again as model size grows past the point of fitting the data exactly. The classical picture predicts only overfitting there.
- **Benign overfitting.** Bartlett, Long, Lugosi, and Tsigler (2020) characterized when fitting noisy data exactly still gives good predictions in linear regression. It requires many more unimportant directions in parameter space than samples.
- **Nonvacuous bounds.** Dziugaite and Roy (2017) used PAC-Bayes bounds, which depend on the trained network rather than the whole class. They computed nonvacuous error bounds for stochastic networks with millions of parameters.

Training is also hard in the worst case.

- **Blum and Rivest (1992).** Deciding whether a 3-node network of threshold units can fit a training set is NP-complete.
- **Chen, Gollakota, Klivans, and Meka (2022).** Learning two-hidden-layer ReLU networks on Gaussian inputs needs superpolynomially many queries in the statistical query model, even without noise. They also give cryptographic hardness, under the Learning with Rounding assumption.

So real data must have structure that worst-case theory ignores. Finding that structure is an open problem.

## Summary

- Finite VC dimension is necessary and sufficient for learning from few samples.
- Efficient learning needs more. Proper learning can be NP-hard even when improper learning is easy. Some classes are hard to learn in any form under cryptographic assumptions.
- Recent work pins down optimal sample complexity and connects learning to compression, privacy, and logic.
- Deep learning sits outside the worst-case theory. Explaining it is an active research area.

## References

- S. Shalev-Shwartz and S. Ben-David, *Understanding Machine Learning: From Theory to Algorithms*, Cambridge University Press, 2014. Chapters 2–6.
- M. Kearns and U. Vazirani, *An Introduction to Computational Learning Theory*, MIT Press, 1994.
- L. Valiant, "A Theory of the Learnable," *Communications of the ACM*, 1984.
- A. Blumer, A. Ehrenfeucht, D. Haussler, and M. Warmuth, "Learnability and the Vapnik–Chervonenkis Dimension," *Journal of the ACM*, 1989.
- V. Vapnik and A. Chervonenkis, "On the Uniform Convergence of Relative Frequencies of Events to Their Probabilities," *Theory of Probability and Its Applications*, 1971.
- N. Sauer, "On the Density of Families of Sets," *Journal of Combinatorial Theory, Series A*, 1972.
- S. Shelah, "A Combinatorial Problem; Stability and Order for Models and Theories in Infinitary Languages," *Pacific Journal of Mathematics*, 1972.
- M. Anthony and P. Bartlett, *Neural Network Learning: Theoretical Foundations*, Cambridge University Press, 1999.
- A. Ehrenfeucht, D. Haussler, M. Kearns, and L. Valiant, "A General Lower Bound on the Number of Examples Needed for Learning," *Information and Computation*, 1989.
- L. Pitt and L. Valiant, "Computational Limitations on Learning from Examples," *Journal of the ACM*, 1988.
- M. Kearns and L. Valiant, "Cryptographic Limitations on Learning Boolean Formulae and Finite Automata," *Journal of the ACM*, 1994.
- A. Klivans and A. Sherstov, "Cryptographic Hardness for Learning Intersections of Halfspaces," *Journal of Computer and System Sciences*, 2009.
- A. Daniely and S. Shalev-Shwartz, "Complexity Theoretic Limitations on Learning DNF's," *COLT*, 2016.
- S. Hanneke, "The Optimal Sample Complexity of PAC Learning," *Journal of Machine Learning Research* 17, 2016.
- K. G. Larsen, "Bagging is an Optimal PAC Learner," *COLT*, 2023.
- N. Littlestone and M. Warmuth, "Relating Data Compression and Learnability," unpublished manuscript, 1986.
- S. Moran and A. Yehudayoff, "Sample Compression Schemes for VC Classes," *Journal of the ACM* 63(3), 2016.
- O. Bousquet, S. Hanneke, S. Moran, R. van Handel, and A. Yehudayoff, "A Theory of Universal Learning," *STOC*, 2021.
- N. Alon, R. Livni, M. Malliaris, and S. Moran, "Private PAC Learning Implies Finite Littlestone Dimension," *STOC*, 2019.
- M. Bun, R. Livni, and S. Moran, "An Equivalence Between Private Classification and Online Prediction," 2020 (arXiv:2003.00563).
- S. Ben-David, P. Hrubeš, S. Moran, A. Shpilka, and A. Yehudayoff, "Learnability Can Be Undecidable," *Nature Machine Intelligence* 1, 2019.
- P. Bartlett, N. Harvey, C. Liaw, and A. Mehrabian, "Nearly-Tight VC-Dimension and Pseudodimension Bounds for Piecewise Linear Neural Networks," *Journal of Machine Learning Research* 20, 2019.
- C. Zhang, S. Bengio, M. Hardt, B. Recht, and O. Vinyals, "Understanding Deep Learning Requires Rethinking Generalization," *ICLR*, 2017.
- V. Nagarajan and J. Z. Kolter, "Uniform Convergence May Be Unable to Explain Generalization in Deep Learning," *NeurIPS*, 2019.
- M. Belkin, D. Hsu, S. Ma, and S. Mandal, "Reconciling Modern Machine-Learning Practice and the Classical Bias–Variance Trade-Off," *PNAS* 116(32), 2019.
- P. Bartlett, P. Long, G. Lugosi, and A. Tsigler, "Benign Overfitting in Linear Regression," *PNAS* 117(48), 2020.
- G. K. Dziugaite and D. Roy, "Computing Nonvacuous Generalization Bounds for Deep (Stochastic) Neural Networks with Many More Parameters than Training Data," *UAI*, 2017.
- A. Blum and R. Rivest, "Training a 3-Node Neural Network is NP-Complete," *Neural Networks* 5(1), 1992.
- S. Chen, A. Gollakota, A. Klivans, and R. Meka, "Hardness of Noise-Free Learning for Two-Hidden-Layer Neural Networks," *NeurIPS*, 2022.

<!-- ===== footer (js/nav.js) ===== -->

Probably Approximately Useful · A final project for 15-455 Undergraduate Complexity Theory, Carnegie Mellon University, Fall 2026 · Dev Sharma
