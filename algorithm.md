The problem is that our ability to reach a target vector depends on the number of available ingredients
Take for example Teensy power: if we have no condiments left, it can't go any higher!

Idea: no more separate level vectors and type vectors
Idea: reduce ingredient vectors according to some LI basis+
Idea:To compute achievability of MP target:
  For each component of the target:
    subtract 100 then Compute achievability normally
  Result is the most achievable of those

Idea: no more relative taste vector - level, MP, and taste
  Taste is decided with an up-front game plan



Mv = v'

DO YOU WANT TO MAKE A SANDWICH?

Create candidate TARGET VECTORS
Take each ingredient vector and convert negative components to be zero for each zero component in the target vector
Take each ingredient vector and transform to a unit in ingredient space
  This transform is static
Transform target vector to ingredient space
Find component with highest product with transformed target
That's the choice!
