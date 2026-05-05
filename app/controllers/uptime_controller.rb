require "net/http"
require "uri"

class UptimeController < ApplicationController
  def stats
    uri = URI("https://api.uptimerobot.com/v2/getMonitors")
    result = Net::HTTP.post_form(uri, {
      api_key: ENV["UPTIMEROBOT_API_KEY"],
      custom_uptime_ratios: "90",
      format: "json"
    })

    data = JSON.parse(result.body)
    monitor = data["monitors"]&.first

    render json: {
      uptime_90d: monitor["custom_uptime_ratio"].to_f,
      status: monitor["status"] # 2 = up, 9 = down
    }
  end
end
