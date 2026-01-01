def calculate(a, op, b):
    if op == '+':
        return a + b
    if op == '-':
        return a - b
    if op == '*':
        return a * b
    if op == '/':
        if b == 0:
            raise ZeroDivisionError("Cannot divide by zero")
        return a / b
    raise ValueError(f"Unknown operator: {op}")

if __name__ == "__main__":
    try:
        a = float(input("First number: "))
        op = input("Operator (+ - * /): ").strip()
        b = float(input("Second number: "))
        result = calculate(a, op, b)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")
