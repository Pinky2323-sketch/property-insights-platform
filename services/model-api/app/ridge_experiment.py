"""Compares plain LinearRegression with scaled Ridge at several alpha values. Does not change the saved model."""

import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from app.train import FEATURES, load_data

ALPHAS = [0.1, 1, 3, 10, 30]


def unscaled_coefficients(model):
    """Returns (coefficients, intercept) in the original feature units."""
    if hasattr(model, "named_steps"):
        scaler = model.named_steps["standardscaler"]
        ridge = model.named_steps["ridge"]
        coefs = ridge.coef_ / scaler.scale_
        intercept = ridge.intercept_ - float(np.sum(coefs * scaler.mean_))
        return coefs, intercept
    return model.coef_, model.intercept_


def main():
    X, y = load_data()
    kfold = KFold(n_splits=5, shuffle=True, random_state=42)

    candidates = {"LinearRegression": LinearRegression()}
    for alpha in ALPHAS:
        candidates[f"Ridge a={alpha}"] = make_pipeline(StandardScaler(), Ridge(alpha=alpha))

    print(f"\n{'model':<18}{'R2':>8}{'RMSE':>10}{'MAE':>10}")
    rows = {}
    for name, model in candidates.items():
        predictions = cross_val_predict(model, X, y, cv=kfold)
        rmse = float(np.sqrt(mean_squared_error(y, predictions)))
        print(f"{name:<18}{r2_score(y, predictions):>8.4f}{rmse:>10.0f}{mean_absolute_error(y, predictions):>10.0f}")
        model.fit(X, y)
        rows[name] = unscaled_coefficients(model)[0]

    print("\nCoefficients (per unit):")
    print(f"{'feature':<26}" + "".join(f"{name[:12]:>14}" for name in rows))
    for i, feature in enumerate(FEATURES):
        print(f"{feature:<26}" + "".join(f"{coefs[i]:>14.1f}" for coefs in rows.values()))


if __name__ == "__main__":
    main()