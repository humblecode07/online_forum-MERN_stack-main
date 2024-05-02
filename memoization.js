const fib = (n, memo={}) => {
    if (n in memo) return memo[n];
    if (n <= 2) return 1;
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    console.log("Current memo: " + memo[n])
    return memo[n]
}


const fibArr = (n, memo = []) => {
    if (memo[n]) return memo[n];
    if (n <= 2) return 1;
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}

function fibIterative(n) {
    if (n <= 1) {
        return n;
    }
    
    let prev = 0;
    let current = 1;
    for (let i = 2; i <= n; i++) {
        let nextFib = prev + current;
        prev = current;
        current = nextFib;
    }
    return current;
}

// console.log(obj[4])


// console.log(fib(50)) 