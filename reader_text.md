# Reader text: Probably Approximately Useful

Plain prose from every page, for editing. Left out: definition, theorem, lemma, corollary, and example boxes; proofs; images and figures; the notation table; widgets; and display math (each removed equation is marked [display math]). Inline math is kept. Each `<!-- ===== file ===== -->` line marks the page the text below it comes from.

---

<!-- ===== index.html ===== -->

# Probably Approximately Useful

*VC dimension and the Fundamental Theorem of PAC Learning*

Computational learning theory is a distinctive model within complexity theory. It asks what a *learner* can learn from labeled examples. Can it label new examples correctly? How many examples does it need?

We start with an example from [David Abel](https://david-abel.github.io/blog/posts/learning_theory.html). Alice is teaching Boris English. She starts with the word "banana".

1. Alice points at a yellow banana and says "banana". Boris does not know what the word means. It could mean yellow, fruit, curved, or banana.
2. She points at a brown banana. It is also a banana, so the word does not mean yellow.
3. She points at an apple and says "not banana". An apple is a fruit, so the word does not mean fruit.
4. She points at a curved boomerang and says "not banana". So the word does not mean curved. Only "banana" fits every example.

Boris's guesses form a collection known as a **hypothesis class**. Each example helps to eliminate hypotheses that are inconsistent with that example.

Learning theory's model of machine learning operates the same way. A program sees labeled examples and must assign labels to new, unseen examples. Since Boris will not encounter every banana in existence, we don't expect him to classify every single one correctly. Instead, we require that the error rate on new examples does not exceed a bound $\varepsilon$. This is **approximately correct**. Moreover, Alice selects the examples from a distribution that isn't known to Boris. Therefore, we require that he be "approximately correct" with a probability of at least $1-\delta$ based on the examples he has seen. This is referred to as being **probably approximately correct**. Together, a hypothesis class which is able to achieve this after a fixed number of examples is said to be **PAC learnable**. There is an additional requirement that the number of examples doesn't depend on the specific distribution Alice chooses. The main question in PAC learning is: how many examples does Boris need?

The answer depends on two factors. First, the hypothesis class may be finite or infinite. Second, there might exist a hypothesis that is perfectly accurate. This scenario is called **realizable**. If no hypothesis is perfect, the situation is termed **agnostic**; in this case, we aim for the learning algorithm to perform nearly as well as the best hypothesis within that class.

Suppose the hypothesis class is finite and the scenario is realizable. In that case, the number of examples Boris requires scales with $\log|\mathcal{H}|$. However, in practice, useful hypothesis classes are often infinite. An example of this is the use of **thresholds** over the set of real numbers ($\mathbb{R}$). Choose a threshold value $t$, and label $x$ as "positive" if $x \ge t$. There is a possible hypothesis for every real number $t$, meaning $\log|\mathcal{H}|$ is infinite. Nevertheless, these thresholds are easy to learn.

Therefore, counting the number of hypotheses is not an accurate metric. Since a learner only sees finitely many examples, what matters instead is how many ways the hypothesis class can label the examples it sees. The **VC dimension** measures this. It is the size of the largest set that $\mathcal{H}$ can label in every possible way. For thresholds it is 1.

The key result we will discuss is the **Fundamental Theorem of PAC Learning**: a hypothesis class $\mathcal{H}$ is PAC-learnable *if and only if* its VC dimension is finite. This holds for both the realizable and agnostic settings. The two directions address different aspects: if the VC dimension is finite, a simple learning strategy works (pick the hypothesis that minimizes errors on the training samples). If it is infinite, no PAC learner can learn the class.

These results are fundamentally about the number of examples, not computation. To connect this back to complexity theory, the final section poses a question that challenges researchers: when is learning actually **efficient**?

## Who this is for

Students who have taken 15-455 (Undergraduate Complexity Theory). We assume comfort with proofs, asymptotic notation, and basic discrete probability (union bound, expectation, concentration). No machine learning background is needed.

## Chapters

1. [Learning from Samples](chapters/1-pac.html): the PAC model and finite hypothesis classes
2. [Shattering & VC Dimension](chapters/2-vc-dimension.html): measuring the size of infinite classes (interactive)
3. [The Sauer–Shelah Lemma](chapters/3-sauer-shelah.html): from exponential to polynomial (interactive)
4. [Uniform Convergence](chapters/4-uniform-convergence.html): why empirical error tracks true error
5. [The Fundamental Theorem](chapters/5-fundamental-theorem.html): finite VC dimension ⇔ PAC learnable
6. [Beyond](chapters/6-beyond.html): connections to complexity theory

<!-- ===== chapters/1-pac.html ===== -->

# 1. Learning from Samples

## The setup

A **domain** $\mathcal{X}$, labels $\{0,1\}$, and an unknown distribution $\mathcal{D}$ over *labeled examples* $\mathcal{X} \times \{0,1\}$. The learner sees a sample $S = ((x_1, y_1), \dots, (x_m, y_m))$ drawn i.i.d. from $\mathcal{D}$, and outputs a hypothesis $h : \mathcal{X} \to \{0,1\}$. It chooses $h$ from a fixed **hypothesis class** $\mathcal{H}$.

Note that in our setup, the learner does not know anything about the distribution $\mathcal{D}$. It only sees the sample $S$.

We can distinguish two types of error of the model. $L_{\mathcal{D}}(h)$ is the true error over any examples. However, we cannot compute this since we don't know what $\mathcal{D}$ is. Instead, $L_S(h)$ is a proxy that we use and can compute.

Note that if the hypothesis class is realizable and $L_{\mathcal{D}}(h^\star) = 0$ then $L_S(h^\star) = 0$ too. For the remainder of chapters 1 to 3, we will assume realizability throughout. In chapter 4, we will discuss the agnostic case.

As mentioned in the intro, the definition has three parts.

- **Approximately correct:** the error is at most $\varepsilon$.
- **Probably:** this holds with probability at least $1 - \delta$. Some failure is unavoidable. For example, every sample point could be the same $x$.
- **Distribution-free:** one function $m_{\mathcal{H}}$ works for every $\mathcal{D}$. The sample size cannot depend on $\mathcal{D}$.

One can consider the slightly similar role of $\delta$ to the error probability of a randomized algorithm in RP or BPP. However, note that in this case, we write $m$ to be a function of $\delta$ and $\varepsilon$.

## Empirical Risk Minimization

Here is an example of one of the simplest learners. Given a hypothesis class $\mathcal{H}$, pick the hypothesis $h \in \mathcal{H}$ that makes the fewest mistakes on $S$. This learner is called **empirical risk minimization**, or **ERM**. Here, "risk" is another word for error.

$\mathrm{ERM}_{\mathcal{H}}$ outputs any $h \in \mathcal{H}$ that minimizes $L_S(h)$. If there are multiple such $h$ that yield the same minimal value, it may output any of them. In the realizable setting, we have $L_S(h^\star) = 0$; therefore, $\mathrm{ERM}$ will output an $h$ such that $L_S(h) = 0$. Such an $h$ is said to be **consistent** with $S$.

The sample cost grows with description length.

ERM can also fail. Let $\mathcal{X} = [0,1]$ and $\mathcal{H}$ be the set of all functions $\mathcal{X} \to \{0,1\}$. Let $\mathcal{D}$ be uniform on $[0,1]$, with every label equal to $1$. Some $h \in \mathcal{H}$ labels the points of $S$ with $1$ and every other point with $0$. This $h$ is consistent with $S$, so ERM may output it. But it is wrong on every point outside $S$. The key distinction is that the hypothesis class is infinite, so the bound above says nothing. Therefore, $\ln|\mathcal{H}|$ is the wrong measure of size. Chapter 2 defines the right one.

<!-- ===== chapters/2-vc-dimension.html ===== -->

# 2. Shattering & VC Dimension

A learner only sees finitely many points. So what matters is how many ways $\mathcal{H}$ can label a finite set, not how many hypotheses it has.

Example: thresholds on $C = \{1, 2, 3\}$ give $\mathcal{H}_C = \{000, 001, 011, 111\}$. That is 4 labelings out of 8.

Shattering is a powerful idea. If $\mathcal{H}$ shatters $C$, labels on part of $C$ say nothing about labels on the rest. Every labeling of the unseen points is still consistent with what the learner saw. So the learner can only guess. Chapter 5 turns this into a lower bound.

In order to show $\mathrm{VCdim}(\mathcal{H}) = d$, prove two things:

1. *Some* set of size $d$ is shattered.
2. *No* set of size $d+1$ is shattered.

In part 1, you choose the points. In part 2, you must handle every set of $d+1$ points. One unshattered set is not enough. For example, halfplanes cannot shatter three points on a line, but their VC dimension is still $3$.

## The shattering game

These proofs are easier once you have tried to break them. The following game asks you to find a placement of points to shatter a specific hypothesis class or realize that every placement of one more point fails. Simply, place points and pick a class. The widget checks all $2^n$ labelings.

- Find 4 points that rectangles shatter. Then add a fifth.
- Find 3 points that halfplanes shatter. Why do 4 points always fail?
- Place 7 points on a circle and select convex polygons.

## Examples

Here are a few examples that you can test out.

From the previous examples, one might think that the VC dimension equals the number of parameters. It does not.

<!-- ===== chapters/3-sauer-shelah.html ===== -->

# 3. The Sauer–Shelah Lemma

Chapter 2 asked whether $\mathcal{H}$ can realize every labeling of one set. Now, we can take this one step further by asking exactly how many labelings it can realize on $m$ points, as a function of $m$. This is the growth function! In fact, as we'll see in chapter 4, it's the growth function that actually controls how many samples a learner needs.

## The growth function

Here, we are taking the maximum over all subsets of $\mathcal{X}$ consisting of $m$ points. So $\tau_{\mathcal{H}}(m)$ is a worst case. It is the largest number of distinct behaviors $\mathcal{H}$ can show on $m$ points.

Two simple bounds hold.

- $\tau_{\mathcal{H}}(m) \le 2^m$, since $m$ points have only $2^m$ labelings. Equality holds exactly when some $m$-point set is shattered, that is, when $m \le \mathrm{VCdim}(\mathcal{H})$.
- $\tau_{\mathcal{H}}(m) \le |\mathcal{H}|$, since each labeling comes from at least one hypothesis. So the growth function is never worse than the count from Chapter 1.

The key observation here is that for both of these classes, there is a fundamental relation between their growth functions and VC dimensions. Note that both their growth functions are polynomial in $m$. And moreover, the degree of this polynomial matches the VC dimension: 1 for thresholds, 2 for intervals. The Sauer–Shelah lemma says this always happens.

## The lemma

One should read this bound as a count. $\binom{m}{i}$ is the number of subsets of size $i$. So the sum counts the subsets of an $m$-point set with at most $d$ elements. For fixed $d$, this is $O(m^d)$. The form $(em/d)^d$ is an upper bound that's easier to use in calculations.

An important side note is that there is no middle ground. If $\mathrm{VCdim}(\mathcal{H}) = \infty$, then $\tau_{\mathcal{H}}(m) = 2^m$ for every $m$. If $\mathrm{VCdim}(\mathcal{H}) = d$, then $\tau_{\mathcal{H}}(m)$ is at most a polynomial of degree $d$. So every growth function is either $2^m$ for all $m$ or polynomially bounded.

Finally, one may notice from our previous examples that the bound is tight. For thresholds and intervals: $m + 1 = \binom{m}{0} + \binom{m}{1}$ and $\binom{m+1}{2} + 1 = \binom{m}{0} + \binom{m}{1} + \binom{m}{2}$.

## The growth plot

The y-axis is $\log_2$, so $2^m$ is a straight line. The Sauer–Shelah bound equals $2^m$ for $m \le d$. After $m = d$ it bends away and grows like $m^d$. On this scale its slope keeps shrinking, while the slope of $2^m$ stays fixed. So the gap between them grows exponentially. Change $d$ to see where the bend happens.

## Proof

Since it's difficult to count labelings directly, we prove a stronger claim on the subsets of $C$ that $\mathcal{H}$ shatters. It shows that $\mathcal{H}$ has at most as many labelings on $C$ as it has shattered subsets of $C$. Every shattered subset has at most $d$ elements. So it only remains to count subsets of size at most $d$.

The claim implies the lemma. If $\mathrm{VCdim}(\mathcal{H}) \le d$, every shattered $B$ has $|B| \le d$. There are $\sum_{i=0}^{d}\binom{m}{i}$ subsets of $C$ of size at most $d$.

The induction removes one point $c_1$. Labelings of $C$ that differ only at $c_1$ merge into one labeling of the remaining points. We count the merged labelings and the merged pairs separately. Each count is a smaller instance of the claim.

## Why this matters

Recall the proof for finite classes in Chapter 1. A hypothesis $h$ is bad if $L_{\mathcal{D}}(h) > \varepsilon$. ERM fails only if some bad hypothesis is consistent with $S$. A fixed bad hypothesis is consistent with $S$ with probability at most $e^{-\varepsilon m}$. A union bound over all bad hypotheses gives a failure probability of at most $|\mathcal{H}|\, e^{-\varepsilon m}$. If $\mathcal{H}$ is infinite, this bound says nothing.

Now, suppose two hypotheses give the same labeling of the sample. Then either both are consistent with $S$ or neither is. So the union bound only needs to count labelings of the sample, not hypotheses. Chapter 5 proves a bound of this kind. The failure probability is at most $2\,\tau_{\mathcal{H}}(2m)\, e^{-c\varepsilon m}$ for some constant $c$.

This is where Sauer–Shelah comes in. This bound is small only if $\tau_{\mathcal{H}}(2m)$ is small. If $\mathrm{VCdim}(\mathcal{H}) = d$, Sauer–Shelah gives $\tau_{\mathcal{H}}(2m) \le (2em/d)^d$ for $2m \ge d$. This grows only polynomially in $m$, while $e^{-c\varepsilon m}$ shrinks exponentially, so for large $m$ the bound is small.

<!-- ===== chapters/4-uniform-convergence.html ===== -->

# 4. Uniform Convergence

## Dropping realizability

Now, we will remove the realizability assumption. No hypothesis in $\mathcal{H}$ may be perfect. We can no longer ask for error $\le \varepsilon$. Instead, we ask to be nearly as good as the best hypothesis in the class.

Clearly, when realizability holds, $\min_{h'} L_{\mathcal{D}}(h') = 0$ and this is exactly PAC learnability from Chapter 1.

## Uniform convergence

Recall that ERM chooses the hypothesis with the smallest error. This is a good choice only if empirical error is a good estimate of true error. Specifically, we need $L_S(h)$ to be close to $L_{\mathcal{D}}(h)$ for every $h \in \mathcal{H}$. We require this property over all $h$ since ERM's choice depends on $S$. A sample with this property is called **representative**.

Moreover, we say a class has the **uniform convergence property** if, for every distribution $\mathcal{D}$, a large enough sample is representative with high probability. "Uniform" means the guarantee holds for all of $\mathcal{H}$ at once.

So if $\mathcal{H}$ has the uniform convergence property, ERM is an agnostic PAC learner with $m_{\mathcal{H}}(\varepsilon,\delta) \le m^{UC}_{\mathcal{H}}(\varepsilon/2, \delta)$. Take $m \ge m^{UC}_{\mathcal{H}}(\varepsilon/2,\delta)$. With probability at least $1-\delta$, $S$ is $\frac{\varepsilon}{2}$-representative, and the lemma applies.

## From one hypothesis to the whole class

Fix $h$ before seeing $S$. Then $L_S(h)$ is an average of $m$ independent trials with mean $L_{\mathcal{D}}(h)$. By Hoeffding's inequality,
[display math]

This does not apply to ERM's output $h_S$, because $h_S$ is chosen to fit $S$. In the example from Chapter 1, $L_S(h_S) = 0$ but $L_{\mathcal{D}}(h_S) = 1$.

So we need the estimate to hold for every $h \in \mathcal{H}$ at once. Let $\mathcal{H}$ be finite. For each $h$, let $B_h$ be the event that $|L_S(h) - L_{\mathcal{D}}(h)| > \varepsilon$. The sample fails if some $B_h$ happens, that is, if the union $\bigcup_{h \in \mathcal{H}} B_h$ happens. The union bound says the probability of a union is at most the sum of the probabilities. Hoeffding bounds each term by $2e^{-2m\varepsilon^2}$, and there are $|\mathcal{H}|$ terms. So [display math] This is at most $\delta$ when $m \ge \ln(2|\mathcal{H}|/\delta)/(2\varepsilon^2)$.

For infinite $\mathcal{H}$, the next section replaces $|\mathcal{H}|$ with the growth function.

## Finite VC dimension ⇒ uniform convergence

The finite-class bound fails for infinite $\mathcal{H}$ because its union bound runs over infinitely many hypotheses. But most of those hypotheses are redundant on any given sample. Two hypotheses that label $S$ the same way have the same empirical error. So on a sample of size $m$, $\mathcal{H}$ shows at most $\tau_{\mathcal{H}}(m)$ distinct behaviors. Let $d = \mathrm{VCdim}(\mathcal{H})$. By Sauer–Shelah, that is at most $(em/d)^d$ once $m \ge d$. We would like to replace $|\mathcal{H}|$ in the union bound with this number.

The proof is beyond the scope of this discussion. See Vapnik and Chervonenkis (1971), or Anthony and Bartlett (1999), Theorem 4.3.

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

Chapters 2–4 proved one direction: finite VC dimension implies learnability. This chapter proves the other direction and states the full theorem. It also gives the sample complexity, which depends on $\mathcal{H}$ only through its VC dimension.

There are a few points to note about these presented bounds. In both settings (realizable and agnostic), the sample size grows linearly in $d$. Doubling the VC dimension roughly doubles the number of samples needed. The dependence on $\delta$ and $\varepsilon$ tells us something about confidence and accuracy. Specifically:

- **Confidence is cheap.** The dependence of $m$ on $\delta$ is only $\log(1/\delta)$. In the model, to make failure 10 times less likely, you would only need to add about $\log 10/\varepsilon$ samples in the realizable case, not 10 times as many.
- **Accuracy is expensive.** On the other hand, the sample size grows like $1/\varepsilon$ in the realizable case and like $1/\varepsilon^2$ in the agnostic case. Halving $\varepsilon$ roughly doubles the sample size in the first case and quadruples it in the second.

This also characterizes what it means to go from realizable to agnostic. Dropping realizability costs a factor of about $1/\varepsilon$ to get the same accuracy for a model.

## Roadmap

The proof is a cycle of implications between the six statements. The lists below give the status and source of each step.

## Sufficiency: finite VC ⇒ learnable

Let $\mathrm{VCdim}(\mathcal{H}) = d < \infty$. Chapter 4 gives uniform convergence with $m^{UC}_{\mathcal{H}}(\varepsilon,\delta) = O\big((d\log(1/\varepsilon) + \log(1/\delta))/\varepsilon^2\big)$. So ERM is an agnostic PAC learner with $m_{\mathcal{H}}(\varepsilon,\delta) \le m^{UC}_{\mathcal{H}}(\varepsilon/2,\delta)$.

In the realizable case we can do better. ERM outputs a consistent $h$. We only need that no bad $h$ is consistent. The argument behind the VC inequality in Chapter 4 adapts to this event:

With Sauer–Shelah, this is at most $\delta$ for $m = O\big((d\log(1/\varepsilon) + \log(1/\delta))/\varepsilon\big)$. This matches the upper bound in the quantitative theorem.

## Necessity: infinite VC ⇒ not learnable

No single learner succeeds on every task. For any learner and any sample size smaller than half the domain, some distribution with a perfect labeling makes the learner fail with constant probability.

Idea: put $\mathcal{D}$ on a set $C$ of $2m$ points. The sample misses at least half of $C$. On the missed points, the labels can be anything. The learner has no information about them.

The same argument with a shattered set of size $d$ shows $m_{\mathcal{H}} \ge d/2$ for small constant $\varepsilon, \delta$. The full lower bound $\Omega\big((d + \log(1/\delta))/\varepsilon\big)$ is due to Ehrenfeucht, Haussler, Kearns, and Valiant (1989).

<!-- ===== chapters/6-beyond.html ===== -->

# 6. Beyond: Connections to Complexity Theory

The Fundamental Theorem counts *samples*, not *time*. It says when a learner can succeed with few examples. It does not say whether a learner can find a good hypothesis quickly. This chapter connects learning to the rest of complexity theory. It states results without proof and points to the sources.

## Efficient learnability

To talk about running time, the domain needs a size. Let $\mathcal{X}_n = \{0,1\}^n$ and let $\mathcal{H}_n$ be a class over $\mathcal{X}_n$. Each $h \in \mathcal{H}_n$ has a description of size $\mathrm{size}(h)$, such as the length of a formula.

Chapter 5 shows that ERM is a PAC learner whenever the VC dimension is finite. So for these classes, the number of samples is not the obstacle. What remains is computation: given the sample, find a hypothesis in $\mathcal{H}_n$ that fits it. This task has no distribution and no $\varepsilon$ or $\delta$. It is an ordinary computational problem, so we can ask where it sits among P, NP, and RP.

Under realizability, ERM must solve the search version of the consistency problem: find a consistent $h$. So the complexity of ERM is the complexity of this problem.

If hypotheses have polynomial-size descriptions that can be evaluated in polynomial time, the consistency problem is in NP. A consistent $h$ is the certificate. An efficient algorithm for the search version gives an efficient proper learner, as long as $\mathrm{VCdim}(\mathcal{H}_n)$ is polynomial in $n$: draw polynomially many samples and return a consistent $h$. The Pitt–Valiant theorem below gives a converse. So the consistency problem is the link between learning and the complexity classes from this course.

Here is the idea behind the Pitt–Valiant theorem. Given a sample $S$, run the learner on the uniform distribution over $S$ with $\varepsilon < 1/|S|$. Any hypothesis with error below $1/|S|$ makes no mistakes on $S$. So check whether the output is consistent with $S$. If no consistent $h$ exists, the check always fails. If one exists, the check succeeds with probability at least $1-\delta$.

### Hardness for every output format

Some classes are hard to learn even improperly. Then the hardness rests on assumptions from cryptography or average-case complexity, not on $\mathrm{P} \ne \mathrm{NP}$ alone. The common idea: if a class can compute pseudorandom functions, an efficient learner would distinguish them from random functions.

- **Kearns and Valiant (1994).** Assuming problems such as breaking RSA are hard, Boolean formulas, deterministic finite automata, and constant-depth threshold circuits are not efficiently PAC learnable.
- **Klivans and Sherstov (2009).** A polynomial-time learner for intersections of $n^{c}$ halfspaces, for any constant $c > 0$, would solve certain approximate lattice problems in the worst case. The reduction uses Regev's lattice-based cryptosystems.
- **Daniely and Shalev-Shwartz (2016).** Assuming that refuting random $k$-SAT formulas is hard, DNF formulas with $\omega(\log n)$ terms are not efficiently learnable. It was one of the first hardness-of-learning results based on an assumption other than cryptography.

These results separate two questions. The Fundamental Theorem says how many samples a learner needs. Complexity theory asks whether a learner can use them in polynomial time. The answer can be no, even when few samples suffice.

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

<!-- ===== footer (js/nav.js) ===== -->

Probably Approximately Useful · A final project for 15-455 Undergraduate Complexity Theory, Carnegie Mellon University, Fall 2026 · Dev Sharma
