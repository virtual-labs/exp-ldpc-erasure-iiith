We describe the message passing algorithm for achieving Bit-wise Maximum Aposterior Probability Decoding of linear codes on erasure channels. 

In the experiment titled 'Maximum Likelihood (ML) Decoding of Codes on Binary Input Channels', we observed that the block-MAP estimate had a similar expression, except that we were focussed on decoding the estimating the entire transmitted codeword (or the entire 'block') according to the maximum-aposteriori probability expression for the whole codeword given the received vector $\bm{y}$. However, in this and the subsequent experiments regarding decoding of LDPC codes, we will do *bit-wise MAP decoding**.

Let $\bm{x}=(x_0,\ldots,x_{n-1})\in {\cal C}$ be the codeword transmitted from the linear code $\cal C$ of dimension $k$. Let $\bm{y}=(y_0,\ldots,y_{n-1})$ be the received vector from the channel. The bit-wise MAP estimate of the bit $x_i$ is based on the value of the log-likelihood ratio (LLR) of $x_i$ given $\bm{y}$, denoted by $L(x_i|\bm{y})$, and  defined as follows. 

$$L(x_i)\triangleq \log\left(\frac{p(x_i=0|\bm{y})}{p(x_i=1|\bm{y})}\right).$$

<!-- In the case of erasure channels, we assume without loss of generality that $x_i\in\{+1,-1}$, under a bipolar signalling scheme. Thus, the LLR $L(x_i)$ is then defined as  -->
<!-- $$L(x_i)\triangleq \log\left(\frac{p(x_i=+1|\bm{y})}{p(x_i=-1|\bm{y})\right)$$. -->

The bitwise MAP estimate for $x_i$ is then denoted by $\hat{x}_i$ and calculated as follows. 
$$\begin{align}
\hat{x}_i=\begin{cases}0,& \text{if}~L(x_i)>0\\
1, & \text{if}~L(x_i)<0.
\end{cases}
\end{align}
$$
Note that we assume ties are broken arbitrarily, i.e., the decoder choose the estimate $\hat{x}_i$ randomly if $L(x_i|\bm{y})=0$. 


With this assumption in mind, we describe a decoding technique based on a general class of algorithms on graphs, which are known as message passing algorithms. Essentially, we run a number of rounds of passing messages from the variable nodes of the Tanner graphs to the check nodes and vice-versa. These rounds, when they complete, lead to two possibilities at which the algorithm is terminated. The first possibility is that we end with a fully decoded codeword estimate, which is also correct. The second possibility is that we end up with a partially decoded estimate, which is correct only in the decoded bits, but may have some erased coordinates which cannot be decoded by any algorithm. 

In other words, this iterative procedure of message passing implements the MAP decoding algorithm in an efficient manner, for all LDPC codes. 

Before describing the algorithm, we give a short note on the motivation for this algorithm. 

### The connection between the bit-wise MAP algorithm and identifying compatible codeword(s)

Observe that, in the erasure channel, for a transmitted codeword $\bm{x}=(x_0,\dots,x_{n-1})$ the received vector $\bm{y}=(y_0,\dots,y_{n-1})$ is such that $y_i=x_i$ or $y_i=?$, for all $i\in\{0,\dots,n-1\}$. The goal in decoding therefore is to reconstruct the erased symbols, as the non-erased symbols in $\bm{y}$ and $\bm{x}$ are identical. 

It is not difficult to see that if the bit-wise MAP decoding estimate for the $i^{th}$ bit of the codeword, denoted by $\hat{x}_i$ is be exactly the correct bit $x_i$ in the transmitted codeword, then among all codewords $\bm{c}\in{\cal C}$ which are compatible with the received vector $\bm{y}$ (i.e., those codewords which match $\bm{y}$ in all unerased positions), the $i^{th}$ co-ordinate $c_i$ is same. 

Since this must be true for all the unerased bits, it must be the case that there must be exactly one codeword, which must be the exact transmitted codeword in ${\cal C}$, if the bit-wise MAP estimate is indeed correct. 

Now, if there is no such unique codeword, then, the bit-wise MAP decoder is surely unable to identify the exact codeword transmitted, in such a scenario. Thus, in this case, we cannot estimate all the codeword bits uniquely. We will have to decode only those bits which are identical in all codewords compatible to $\bm{y}$. The other coordinates may not be possible to be identified uniquely.

With these ideas in mind, we are now ready to describe the working of the message-passing algorithm. 

### Message Passing on the Tanner Graph for Erasure Channels 

Consider the code with the parity check $H$ matrix given as follows. 

$$H=\begin{bmatrix}1&0&0&1&1&1\\
0&1&0&1&0&1\\
0&0&1&0&1&1
\end{bmatrix}.$$

Observe that any two columns of this matrix are linearly independent, so this code is capable of correcting any erasure pattern with upto two erasures. In fact, some patterns with upto three erasures can also get corrected by a block-wise MAP decoder. But here, we will focus on at most two erasures. Further, the generator matrix of this code can be obtained as 
%%%%
$$G=\begin{bmatrix}1&1&0&1&0&0\\
1&0&1&0&1&0\\
1&1&1&0&0&1\end{bmatrix}.$$

Clearly, this code has $8$ codewords. Assume that the codeword transmitted is $\bm{x}=(1,0,0,0,1,0)$. Let the received vector be $\bm{y}=(1,0,0,?,?,?)$. We see that there are three erasures here. Essentially, from the discussions in the previous section, finding the bit-wise MAP estimate in this case is the same as finding each bit which is identical in all codewords that are compatible with the received vector $\bm{y}=(1,0,0,?,?,?)$. Writing out the entire set of $8$ codewords, we can observe that there is infact only the one codeword, which is the same as the transmitted codeword, which has this property of being compatible with $\bm{y}$. We now present how the peeling decoder obtains this codeword systematically. 

![image](files/Users/jzhang/Desktop/Isolated.png)




---

As described in the theory of the previous experiment, a memoryless channel is described by the input alphabet $\cal X$ (set of possible values taken by the input random variable $X$), the output alphabet $\cal Y$ (possible values taken by the output random variable $Y$), and the transition probabilities $p_{Y|X}(y|x), \forall x\in{\cal X}, y\in{\cal Y}$. 

Consider that we use the channel $n$ times, i.e, our input sequence is a vector $\bm{x}=(x_0,\ldots,x_{n-1})\in {\cal X}^n$ (recall that ${\cal X}^n$ denotes the set of all $n$-length tuples with entries from ${\cal X}$). Because of the noisy characteristics of the channel (governed by the transition probabilities $p_{Y|X}$), the transmitted input vector $\bm{x}$ is transformed, into a random output vector $\bm{Y}=(y_0,\ldots,y_{n-1})$, governed by the transition probabilites $p_{\bm{Y}|\bm{X}}(\bm{y}|\bm{x})=\prod_{i=1}^np(y_i|x_i)$. 

The receiver observes the output sequence $\bm{Y}=\bm{y}$. The goal of the receiver is then to decode the transmitted vector $\bm{x}$. The estimate of the transmitted vector is denoted by $\hat{\bm{x}}$. However, because of the fact that the channel noise is random, there could be several possible vectors in ${\cal X}^n$ which result in the same received vector $\bm{y}$. Therefore, the decoder at the receiver has to have some *metric*, based on which it can decide the value for the estimate  $\hat{\bm{x}}$. 

Specifically, we consider the *likelihood* as the decoding metric, in this virtual lab. That is, the decoder seeks to find that $\bm{x}$ which maximizes the probability $p(\bm{y}|\bm{x})$. 
$$\hat{\bm{x}}=arg\max p(\bm{y}|\bm{x}).$$ 
The probability $p(\bm{y}|\bm{x})$ is called the **likelihood of $\bm{x}$ with respect to the received vector $\bm{y}$.**

However, the problem that there could be several candidates for such $\bm{x}\in{\cal X}^n$ which maximize the likelihood. This problem can be resolved by choosing the transmit sequences from a code. Specifically, we are interested in choosing $n$-length linear codes for binary input channels. 

## Using Linear Codes on Memoryless Binary-Input Channels

As defined before, an $n$-length linear code $\cal C$ over $\mathbb{F}_2$ of rate $\frac{k}{n}$ is a $k$-dimensional subspace of $\mathbb{F}_2^n$. 

---

***The ML Decoding Rule for Linear Codes***

Assuming that the receiver receives the vector $\bm{y}$, the Maximum Likelihood decoding rule (called the **ML decoding rule**) when using such a code on a binary-input channel, is written as follows. 

$$\hat{\bm{x}}=arg_{\bm{x}\in{\cal C}}\max p(\bm{y}|\bm{x}).$$ 

In case of there being multiple codewords in $\cal C$ which maximize the likelihood, we will assume that the decoder will *break the ties arbitrarily*, i.e., the decoder declares any of these codewords (that maximize the likelihood) as the estimate. This estimate $\hat{\bm{x}}$ is called the **ML estimate** for the input codeword $\bm{x}$. 

---

The figure shows a depiction of using a linear code with such a decoder. 

---

**NOTE**

Add generic decoder picture when using a linear code $\cal C$. Ask me how the pic should look. 

---

We now explore via an example how the ML decoding works for linear codes on the three channel models we consider in this work. Throughout the three channels, we consider the code ${\cal C}$ which is the rowspace of the matrix 
$$G=
\begin{pmatrix}
1&0&1&0&1\\
0&1&0&1&1
\end{pmatrix}.$$
This code $\cal C$ contains $4$ codewords, which are all the $\mathbb{F}_2$-linear-combinations of the two rows of $G$. Thus we have,

$${\cal C}=\{\bm{x}_1=(0,0,0,0,0),\bm{x}_2=(1,0,1,0,1), \bm{x}_3=(0,1,0,1,1), \bm{x}_4=(1,1,1,1,0)\}.$$ 

We now see how the ML decoder decodes, when the codeword $\bm{x}_1=(0,0,0,0,0)$ is transmitted, in each of the three channels we consider in this virtual lab. 

#### 1. Binary Erasure Channel $BEC(\epsilon)$: 

Assume that the received vector $\bm{y}=(?,0,?,0,0)$. In this case, we see that $p(\bm{y}|\bm{x}_i)=0, \forall i=2,3,4$ as $\bm{x}_i$ and $\bm{y}$ are not compatible vectors, for any $i=2,3,4$. At the same time, we have $p(\bm{y}|\bm{x}_1)=\epsilon^2(1-\epsilon)^3$. Since $\epsilon\in(0,1)$, clearly, we see that $p(\bm{y}|\bm{x}_1)>p(\bm{y}|\bm{x}_i), \forall i=2,3,4.$ Thus, the ML decoder outputs the estimate $\hat{\bm{x}}$ as the codeword $\bm{x}_1=(0,0,0,0,0)$. Thus, the ML decoder decodes the transmitted codeword correctly. 

It is easy to present a scenario when the decoding can be incorrect. Consider the received vector with three erasures, $\bm{y}=(?,0,?,0,?)$. In this case, we see that $p(\bm{y}|\bm{x}_1)=p(\bm{y}|\bm{x}_2)=\epsilon^3(1-\epsilon)^2$, while  $p(\bm{y}|\bm{x}_i)=0, \forall i=3,4$. Therefore, in this case, the decoder can declare one of $\bm{x}_1$ or $\bm{x}_2$ as the estimate. In case the decoder chooses $\bm{x}_2$, clearly the decoder will be making a decoding error. 

### 2. Binary Symmetric Channel $BSC(p)$: 

Recollect, from the previous experiment, that in the channel $BSC(p)$, for any $\bm{x},\bm{y}\in\mathbb{F}_2^n$, we have the following:
$$p(\bm{y}|\bm{x})=p^{d(\bm{x},\bm{y})}(1-p)^{n-d(\bm{x},\bm{y})},$$
where $d(\bm{x},\bm{y})$ denotes the Hamming distance (number of positions where $\bm{x}$ and $\bm{y}$ have distinct values). We assume that $p<0.5$. 

Assume that the received vector $\bm{y}=(1,0,0,0,0)$. Thus, with respect to the four codewords in $\cal C$, we have the following for $\bm{y}=(1,0,0,0,0)$.
$$
\begin{align}
p(\bm{y}|\bm{x}_1)&=p(1-p)^4,\\
p(\bm{y}|\bm{x}_2)&=p^2(1-p)^3,\\
p(\bm{y}|\bm{x}_3)&=p^4(1-p),\\
p(\bm{y}|\bm{x}_4)&=p^3(1-p)^2.
\end{align}
$$
Clearly, when $p<0.5$, we see that  $p(\bm{y}|\bm{x}_1)$ is the highest among all the $p(\bm{y}|\bm{x}_i), i=1,...,4$. Thus, we can say that the ML estimate is $\bm{x}_1$. Note that the decoder indeed makes no error, in case the true transmitted codeword was $\bm{x}_1$. 

Now, we explain a scenario when the decoder's estimate involves choosing one among many possible codewords, each of which has the same likelihood value. For instance, assume that the received word is $\bm{y}=(1,1,0,0,0)$. In this case, 
$$
\begin{align}
p(\bm{y}|\bm{x}_1)&=p^2(1-p)^3,\\
p(\bm{y}|\bm{x}_2)&=p^3(1-p)^2,\\
p(\bm{y}|\bm{x}_3)&=p^3(1-p)^2,\\
p(\bm{y}|\bm{x}_4)&=p^2(1-p)^3.
\end{align}
$$
Thus, in this case, we find that both $\bm{x}_1$ and $\bm{x}_4$ can be valid ML estimates for the true transmitted codeword, since both of them have the same (and largest) likelihood, among all codewords. Observe that, in this case, if the transmitted codeword was $\bm{x}_1$ and the decoder declared $\bm{x}_4$ as the estimate, then we have an error. 

From the above observations, it is clear that, if there are many bit flips when the codeword is transmitted is transmitted through the channel, the probability of decoding error increases. 

### 3. AWGN Channel with Noise ${\cal N}(0,N_0/2)$: 
Recall that, for the memoryless AWGN channel, we have, for any two vectors $\bm{x},\bm{y}\in\mathbb{R}^n$, the probability of receiving vector $\bm{y}$ given that vector $\bm{x}$ was transmitted through the channel is given by
$$p(\bm{y}|\bm{x})=\frac{1}{(\pi N_0)^{n/2}}e^{-\frac{(||\bm{y}-\bm{x}||^2)}{N_0}}.$$

Now, what does it mean to use a binary code on this channel? Observe that the channel really accepts only real numbered input symbols, however, we have binary digits (bits) in the codeword. Therefore, we need a ***modulation scheme***, which maps the bits to real-numbered symbols that we can transmit. 

The simplest modulation scheme when we use a binary code (for example the code $\cal C$ above) on the AWGN channel is to map the binary symbols $\{0,1\}$ to $\{+1,-1\}\in\mathbb{R}$ respectively. This essentially translates to using a ***BPSK (Binary phase shift keying) modulation scheme*** on the AWGN channel, to transmit the bits of the codeword. The fact that we assume bit $0$ is mapped to $+1\in\mathbb{R}$ and the bit $1$ is mapped to $-1\in\mathbb{R}$ translates to using SNR (signal-to-noise ratio) per codeword-bit as $1/(N_0/2)$. To mathematically model a larger SNR value, we could then assume that the channel has a smaller noise power $N_0/2$, without having to change the mapping of the BPSK modulation itself. Under this modulation scheme, the code $\cal C$ is effectively written as follows. 
$${\cal C}=\{\bm{x}_1=(1,1,1,1,1),\bm{x}_2=(-1,1,-1,1,-1), \bm{x}_3=(1,-1,1,-1,-1), \bm{x}_4=(-1,-1,-1,-1,1)\}.$$ 
We call this the ***bipolar representation*** of the code $\cal C$. 

Now, with the code $\cal C$ written in its bipolar representation as above, let us understand the ML decoding, when the received vector is $\bm{y}=(0.5,0.5,-1.2,-1.5,-1.1)$. In this case, observe that we have the following equations which simplify the process of finding the ML estimate. 
$$
\begin{align}
\hat{\bm{x}}&=arg_{\bm{x}\in{\cal C}}\max\frac{1}{(\pi N_0)^{n/2}}e^{-\frac{(||\bm{y}-\bm{x}||^2)}{N_0}}\\
&=arg_{\bm{x}\in{\cal C}}\min||\bm{y}-\bm{x}||^2\\
&=arg_{\bm{x}\in{\cal C}}\min (||\bm{y}||^2+||\bm{x}||^2-2\langle\bm{y},\bm{x}\rangle),
\end{align}
$$
where $\langle\bm{y},\bm{x}\rangle$ is just the scalar product (also known as the ***correlation***) between the vectors $\bm{y}=(y_0,...,y_{n-1})$ and $\bm{x}=(x_0,...,x_{n-1})$, which is precisely $\sum_{i=1}^nx_iy_i$. Note that $n=5$ is the blocklength of the code $\cal C$, in our example. Now, the minimization above is with respect to all $\bm{x}\in{\cal C}$. Observe that the value of $||\bm{y}||^2$ does not change in this minimization. Further, for any $\bm{x}\in{\cal C}$, it is easy to see that $||\bm{x}||=n$ (where $n=5$, in our example), and is therefore constant too. Therefore, the minimization above can be re-written as 
$$
\begin{align}
\hat{\bm{x}}=arg_{\bm{x}\in{\cal C}}\max\langle\bm{y},\bm{x}\rangle.
\end{align}
$$
Thus, finding the ML estimate for the true transmitted codeword is that codeword which has the largest scalar product or correlation with the received vector $\bm{y}$. 

We finally apply this observation to the example hand. We said that the received vector is $\bm{y}=(0.5,0.5,-1.2,-1.5,-1.1)$. To find the ML estimate on the AWGN channel, we find the correlations between each $\bm{x}_i\in{\cal C}$ and $\bm{y}$ and find which one has the largest. We urge the reader to check the following calculations. 
$$
\begin{align*}
\langle\bm{x}_1,\bm{y}\rangle&=0.5 + 0.5 + (-1.2) + (-1.5) + (-1.1) = -2.8\\
\langle\bm{x}_2,\bm{y}\rangle&=-0.5 + 0.5 + 1.2 + (-1.5) + 1.1 = 0.8\\
\langle\bm{x}_3,\bm{y}\rangle&=0.5 + (-0.5) + (-1.2) + 1.5 + 1.1 = 1.4\\
\langle\bm{x}_4,\bm{y}\rangle&= -0.5 + (-0.5) + 1.2 + 1.5 + (-1.1) = 0.6. 
\end{align*}
$$
Therefore, the ML estimate for the transmitted codeword is precisely $\bm{x}_3$. 