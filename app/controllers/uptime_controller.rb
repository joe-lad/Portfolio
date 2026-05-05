require "net/http"
require "uri"

class UptimeController < ApplicationController
  def stats
    # cache NEEDED so my brother doesnt spam refresh and get rate limited
    result = Rails.cache.fetch("uptime_stats", expires_in: 5.minutes) do
      uri = URI("https://api.uptimerobot.com/v2/getMonitors")
      res = Net::HTTP.post_form(uri, {
        api_key: ENV["UPTIMEROBOT_API_KEY"],
        custom_uptime_ratios: "90",
        format: "json"
      })
      data = JSON.parse(res.body)
      monitor = data["monitors"]&.first
      next nil unless monitor
      { uptime_90d: monitor["custom_uptime_ratio"].to_f, status: monitor["status"] }
    rescue JSON::ParserError
      nil
    end

    return render json: { error: "Unavailable" }, status: :bad_gateway unless result
    render json: result
  end
end
