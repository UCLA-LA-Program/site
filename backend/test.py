import random


def lambda_handler(event, context):
    result = f"Hello World {random.randint(0, 100)}\n"

    return {"statusCode": 200, "body": result}
