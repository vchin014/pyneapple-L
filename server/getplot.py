import io
from flask_cors import CORS
from flask import Flask, request, send_file
import matplotlib
matplotlib.use('Agg')  # Use the Agg backend for non-GUI rendering
import matplotlib.pyplot as plt
import numpy as np
import scipy.stats as stats
import math

app = Flask(__name__)

CORS(app)

# City-specific N and LG values
city_data = {
    'Seattle': {'N': 2136, 'LG': 2749484.6911938637},
    'Chicago': {'N': 6162, 'LG': 6450476.306188743},
    'NewYork': {'N': 1757, 'LG': 10491861.230980583},
    'Detroit': {'N': 5171, 'LG': 4676252.021852011}
}

def plot_normal_distribution(N_value, L_value, lg, n):
    rou = (n - 1) / lg
    variance = 1 / (n - 1) * lg * L_value * (1 - L_value/lg)
    sigma = math.sqrt(variance)  # Standard deviation

    x = np.linspace(L_value - 3 * sigma, L_value + 3 * sigma, 100)
    y = stats.norm.pdf(x, L_value, sigma)  # Normal Distribution

    plt.figure(figsize=(9, 4.8))
    plt.plot(x, y, label=f"Normal Distribution ($\\mu = {L_value}, \\sigma^2 = {variance:.2f}$)")

    # 99% quantile
    q_99 = stats.norm.ppf(0.99, L_value, sigma)
    plt.axvline(x=q_99, color='r', linestyle='--', label=f"$K_{{0.99}}(t|p_i) = {q_99}$")

    # 90% quantile
    q_90 = stats.norm.ppf(0.9, L_value, sigma)
    plt.axvline(x=q_90, color='g', linestyle='--', label=f"$K_{{0.90}}(t|p_i) = {q_90}$")

    # Specific x value calculation but not visualized
    k = N_value / rou

    # Shading the entire area under the curve (but not adding to legend)
    plt.fill_between(x, y, color='grey', alpha=0.5)

    # Extend y-axis higher to avoid overlap with the legend
    y_max = np.max(y)
    plt.ylim(0, y_max * 2.0)

    handles, labels = plt.gca().get_legend_handles_labels()
    handles.append(plt.Line2D([], [], color='none'))  # Add an empty handle for K(t|p_i)
    labels.append(f"$K(t|p_i) = {k:.2f}$")

    plt.legend(handles=handles, labels=labels, loc='upper left')

    plt.xlabel("K function values")
    plt.ylabel("Probability Density")

    # Save the figure to a BytesIO object and return it
    output = io.BytesIO()
    plt.savefig(output, format='png')
    output.seek(0)
    plt.close()
    return output

@app.route('/')
def home():
    return "Welcome to the Flask backend!"

@app.route('/generate_plot', methods=['GET'])
def generate_plot():
    try:
        n_value = float(request.args.get('n_value'))
        l_value = float(request.args.get('l_value'))
        city = request.args.get('city')

        if city not in city_data:
            return "Invalid city", 400

        city_info = city_data[city]
        n = city_info['N']
        lg = city_info['LG']

        # Generate the plot with city-specific LG and N values
        plot_output = plot_normal_distribution(n_value, l_value, lg, n)
        return send_file(plot_output, mimetype='image/png')
    except Exception as e:
        return str(e), 500

if __name__ == "__main__":
    app.run(debug=True)
