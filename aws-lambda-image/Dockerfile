FROM public.ecr.aws/lambda/nodejs:18

COPY aws-lambda-image/package*.json ./

COPY artifacts/contracts/ManabitCoin.sol ./artifacts/contracts/
COPY artifacts/contracts/ManabitGacha.sol ./artifacts/contracts/
COPY operation/aws*.js ./operation/